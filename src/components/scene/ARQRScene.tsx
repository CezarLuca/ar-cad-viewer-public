"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CADModel from "./CADModel";

export default function ARQRScene() {
    const { gl } = useThree();
    const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);
    const markerGroupRef = useRef<THREE.Group>(new THREE.Group());
    const arContextRef = useRef<any>(null);

    // AR.js initialization
    useEffect(() => {
        let animationFrameId: number;

        const initializeAR = async () => {
            if (!videoRef.current) return;

            // Get camera stream
            const video = videoRef.current;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            video.srcObject = stream;
            await video.play();

            // Initialize AR.js
            const arScene = new (window as any).THREEx.ArScene({
                renderer: gl,
                source: video,
                cameraParametersUrl: "/data/camera_para.dat",
                sourceWidth: video.videoWidth,
                sourceHeight: video.videoHeight,
                displayWidth: video.videoWidth,
                displayHeight: video.videoHeight,
            });

            // Add marker detection
            const markerControls = new (window as any).THREEx.ArMarkerControls(
                arScene,
                {
                    type: "pattern",
                    patternUrl: "/data/qr-code.patt",
                    size: 1,
                }
            );

            // Position model relative to marker
            markerControls.addEventListener("markerFound", (event: any) => {
                markerGroupRef.current.visible = true;
                markerGroupRef.current.matrix.copy(event.data.matrix);
            });

            markerControls.addEventListener("markerLost", () => {
                markerGroupRef.current.visible = false;
            });

            arContextRef.current = arScene;
            setVideoSize({
                width: video.videoWidth,
                height: video.videoHeight,
            });

            // Render loop
            const animate = () => {
                arScene.process();
                arScene.render();
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();
        };

        initializeAR().catch(console.error);

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream)
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, [gl]);

    return (
        <>
            {/* Camera feed (hidden but necessary for AR processing) */}
            <video
                ref={videoRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    opacity: 0,
                    pointerEvents: "none",
                    zIndex: -1,
                }}
                playsInline
            />

            {/* AR Content */}
            <primitive object={markerGroupRef.current}>
                <CADModel />
            </primitive>
        </>
    );
}
