"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3, Euler, Matrix4, Quaternion } from "three";
import { useXR } from "@react-three/xr";

interface QRTrackerProps {
    onQRDetected: (position: Vector3, rotation: Euler, content: string) => void;
}

const QR_SIZE_MM = 50; // Physical size of QR code in millimeters
const QR_SIZE_M = QR_SIZE_MM / 500; // Convert to meters for THREE.js units
const SCAN_INTERVAL = 500; // Interval for scanning in milliseconds

const QRTracker: React.FC<QRTrackerProps> = ({ onQRDetected }) => {
    // const { gl, camera, scene } = useThree();
    const { camera } = useThree();
    const { session } = useXR();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isTracking, setIsTracking] = useState(false);
    const lastDetectionTime = useRef(0);
    // New ref to throttle scanning regardless of detection success
    const lastScanTime = useRef(0);
    const qrPositionRef = useRef<Vector3 | null>(null);

    const preprocessImage = (
        context: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) => {
        // Apply contrast enhancement and grayscale conversion
        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );
        for (let i = 0; i < imageData.data.length; i += 4) {
            const avg =
                (imageData.data[i] +
                    imageData.data[i + 1] +
                    imageData.data[i + 2]) /
                3;
            imageData.data[i] =
                imageData.data[i + 1] =
                imageData.data[i + 2] =
                    avg > 128 ? 255 : 0;
        }
        context.putImageData(imageData, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        if (!session) return;

        // Set up video and canvas for QR detection
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        videoRef.current = video;
        canvasRef.current = canvas;

        // Set up video dimensions
        canvas.width = 480;
        canvas.height = 360;

        // Get user media
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
                setIsTracking(true);
            })
            .catch((err) => {
                console.error("Error accessing camera: ", err);
            });

        return () => {
            if (video.srcObject) {
                const tracks = (video.srcObject as MediaStream).getTracks();
                tracks.forEach((track) => track.stop());
            }
            setIsTracking(false);
        };
    }, [session]);

    // QR detection logic
    useFrame(() => {
        const now = Date.now();
        // Enforce scanning only once every second
        if (now - lastScanTime.current < 2 * SCAN_INTERVAL) return;
        lastScanTime.current = now;
        if (!isTracking || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        // Draw video frame to canvas for processing
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add image preprocessing for better detection
        const imageData = preprocessImage(context, canvas);

        // Detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            lastDetectionTime.current = now;
            // Extract QR code corners
            const topLeft = new Vector3(
                (code.location.topLeftCorner.x / canvas.width) * 2 - 1,
                -((code.location.topLeftCorner.y / canvas.height) * 2 - 1),
                0
            ).unproject(camera);

            const topRight = new Vector3(
                (code.location.topRightCorner.x / canvas.width) * 2 - 1,
                -((code.location.topRightCorner.y / canvas.height) * 2 - 1),
                0
            ).unproject(camera);

            const bottomLeft = new Vector3(
                (code.location.bottomLeftCorner.x / canvas.width) * 2 - 1,
                -((code.location.bottomLeftCorner.y / canvas.height) * 2 - 1),
                0
            ).unproject(camera);

            const bottomRight = new Vector3(
                (code.location.bottomRightCorner.x / canvas.width) * 2 - 1,
                -((code.location.bottomRightCorner.y / canvas.height) * 2 - 1),
                0
            ).unproject(camera);

            // Calculate center of QR code
            const qrCenter = new Vector3()
                .add(topLeft)
                .add(topRight)
                .add(bottomLeft)
                .add(bottomRight)
                .multiplyScalar(0.25);

            // Calculate direction vectors for orientation
            const rightVector = new Vector3()
                .subVectors(topRight, topLeft)
                .normalize();
            const downVector = new Vector3()
                .subVectors(bottomLeft, topLeft)
                .normalize();
            const normalVector = new Vector3()
                .crossVectors(rightVector, downVector)
                .normalize();

            // Calculate QR code size in image for distance estimation
            const width = new Vector3().subVectors(topRight, topLeft).length();
            const height = new Vector3()
                .subVectors(bottomLeft, topLeft)
                .length();
            const averageSize = (width + height) / 2;

            // Calculate distance based on known physical size using 3D vectors
            // This gives us a distance in Three.js world units
            const alternateEstimatedDistance = QR_SIZE_M / averageSize;

            // Calculate distance based on known physical size
            // Get the physical size of the QR code in the image
            const qrCodeInImageWidth = Math.hypot(
                code.location.topRightCorner.x - code.location.topLeftCorner.x,
                code.location.topRightCorner.y - code.location.topLeftCorner.y
            );

            // Calculate distance based on apparent size in image vs real size
            const focalLength = canvas.width; // A rough approximation of focal length
            const estimatedDistance =
                (QR_SIZE_M * focalLength) / (qrCodeInImageWidth / canvas.width);

            const finalDistance =
                (estimatedDistance + alternateEstimatedDistance) / 2;
            // Direction from camera to QR code
            const direction = new Vector3()
                .subVectors(qrCenter, camera.position)
                .normalize();

            // Position is camera position + direction * distance
            const qrPosition = camera.position
                .clone()
                .add(direction.multiplyScalar(finalDistance));

            // Create rotation matrix from the three orientation vectors
            const rotationMatrix = new Matrix4().makeBasis(
                rightVector,
                downVector,
                normalVector
            );

            // Convert rotation matrix to quaternion, then to euler
            const quaternion = new Quaternion().setFromRotationMatrix(
                rotationMatrix
            );
            const qrRotation = new Euler().setFromQuaternion(quaternion);

            // Add spatial smoothing
            if (qrPositionRef.current) {
                qrPosition.lerp(qrPositionRef.current, 0.3);
            }

            qrPositionRef.current = qrPosition;
            onQRDetected(qrPosition, qrRotation, code.data);

            // Log QR code detection
            console.log("QR code detected:", code.data);
            console.log("QR position:", qrPosition);
            console.log("QR rotation:", qrRotation);
            console.log("Estimated distance:", finalDistance, "meters");
        }
    });

    return null; // No need to render anything
};

export default QRTracker;
