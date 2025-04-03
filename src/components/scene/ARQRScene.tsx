"use client";

import { THREEx } from "@ar-js-org/ar.js-threejs";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, RefObject } from "react";
import { Group, WebGLRenderer } from "three";
import CADModel from "./CADModel";

interface ARContentProps {
    arSceneRef: RefObject<THREEx.ArScene | null>;
    markerGroupRef: RefObject<Group>;
}

// This component will handle the 3D rendering inside R3F
function ARContent({ arSceneRef, markerGroupRef }: ARContentProps) {
    // Get access to the R3F renderer
    const { gl } = useThree();

    // Initialize AR.js within the R3F rendering context
    useEffect(() => {
        if (arSceneRef.current) {
            arSceneRef.current.renderer = gl;
        }
    }, [gl, arSceneRef]);

    // Add AR.js update to the R3F render loop
    useFrame(() => {
        if (arSceneRef.current) {
            arSceneRef.current.process();
            // Don't call arScene.render() here since R3F handles rendering
        }
    });

    return (
        <primitive object={markerGroupRef.current}>
            <CADModel />
        </primitive>
    );
}

// Main component that sets up AR.js and contains the R3F Canvas
export default function ARQRScene() {
    const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);
    const markerGroupRef = useRef<Group>(new Group());
    const arSceneRef = useRef<THREEx.ArScene | null>(null);

    // AR.js initialization
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const initializeAR = async () => {
            try {
                // Get camera stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                videoElement.srcObject = stream;
                await videoElement.play();

                // Set video dimensions
                setVideoSize({
                    width: videoElement.videoWidth,
                    height: videoElement.videoHeight,
                });

                // Initialize AR.js
                const renderer = new WebGLRenderer({
                    antialias: true,
                    alpha: true,
                });
                renderer.setSize(
                    videoElement.videoWidth,
                    videoElement.videoHeight
                );

                const arScene = new THREEx.ArScene({
                    source: videoElement,
                    cameraParametersUrl: "/data/camera_para.dat",
                    sourceWidth: videoElement.videoWidth,
                    sourceHeight: videoElement.videoHeight,
                    displayWidth: videoElement.videoWidth,
                    displayHeight: videoElement.videoHeight,
                    renderer: renderer, // Add the renderer here
                });

                // Add marker detection
                const markerControls = new THREEx.ArMarkerControls(
                    arScene,
                    markerGroupRef.current,
                    {
                        type: "pattern",
                        patternUrl: "/data/qr-code.patt",
                        size: 1,
                    }
                );

                // Position model relative to marker
                markerControls.addEventListener("markerFound", (event) => {
                    markerGroupRef.current.visible = true;
                    markerGroupRef.current.matrix.copy(event.data.matrix);
                });

                markerControls.addEventListener("markerLost", () => {
                    markerGroupRef.current.visible = false;
                });

                arSceneRef.current = arScene;
            } catch (error) {
                console.error("Error initializing AR:", error);
            }
        };

        initializeAR();

        return () => {
            if (videoElement?.srcObject) {
                (videoElement.srcObject as MediaStream)
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);

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
                    width: videoSize.width,
                    height: videoSize.height,
                }}
                playsInline
            />

            {/* R3F Canvas for 3D content */}
            <Canvas
                style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
            >
                <ARContent
                    arSceneRef={arSceneRef}
                    markerGroupRef={markerGroupRef}
                />
            </Canvas>
        </>
    );
}
