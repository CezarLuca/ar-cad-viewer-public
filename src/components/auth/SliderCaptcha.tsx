"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface SliderCaptchaProps {
    onSuccess: (token: string) => void;
    onError: () => void;
    width?: number;
    height?: number;
}

export default function SliderCaptcha({
    onSuccess,
    onError,
    width = 300,
    height = 150,
}: SliderCaptchaProps) {
    const { t } = useTranslations("auth");
    const [isDragging, setIsDragging] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(0);
    const [puzzleX, setPuzzleX] = useState(0);
    const [puzzleY, setPuzzleY] = useState(0);
    const [backgroundImage, setBackgroundImage] = useState<string>("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [tolerance] = useState(15); // pixels

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const sliderPosRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const containerRectRef = useRef<DOMRect | null>(null);

    const drawPuzzlePiece = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number
    ) => {
        const size = 40;
        const r = size * 0.2; // radius for the bumps/indents

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * 0.3, y);
        ctx.lineTo(x + size * 0.7, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.arc(
            x + size,
            y + size * 0.5,
            r,
            Math.PI * 1.5,
            Math.PI * 0.5,
            false
        );
        ctx.lineTo(x + size, y + size * 0.7);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x + size * 0.7, y + size);
        ctx.arc(x + size * 0.5, y + size, r, 0, Math.PI, false);
        ctx.lineTo(x + size * 0.3, y + size);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x, y + size * 0.7);
        ctx.lineTo(x, y + size * 0.3);

        ctx.closePath();
        ctx.fill();
    };

    const generateBackgroundImage = useCallback(() => {
        let canvas = canvasRef.current;

        if (!canvas) {
            canvas = document.createElement("canvas");
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#cecece");
        gradient.addColorStop(0.5, "#e2e2e2");
        gradient.addColorStop(1, "#ebebeb");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#696969";
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = "destination-out";
        drawPuzzlePiece(ctx, puzzleX, puzzleY);

        setBackgroundImage(canvas.toDataURL());
    }, [width, height, puzzleX, puzzleY]);

    const generatePuzzle = useCallback(() => {
        const puzzleSize = 40;
        const newPuzzleX = Math.random() * (width - puzzleSize - 50) + 50;
        const newPuzzleY = Math.random() * (height - puzzleSize - 20) + 10;

        setPuzzleX(newPuzzleX);
        setPuzzleY(newPuzzleY);
        setSliderPosition(0);
        sliderPosRef.current = 0;
        setIsCompleted(false);
    }, [width, height]);

    const updatePosition = () => {
        rafRef.current = null;
        setSliderPosition(sliderPosRef.current);
    };

    const handleStart = useCallback(() => {
        if (isCompleted) return;
        setIsDragging(true);
        const container = containerRef.current;
        if (container) {
            containerRectRef.current = container.getBoundingClientRect();
        }
    }, [isCompleted]);

    const handleMove = useCallback(
        (clientX: number) => {
            if (!isDragging || isCompleted) return;

            const rect = containerRectRef.current;
            if (!rect) return;

            const sliderHalf = 24; // half of 48px draggable width
            const maxPos = width - 48; // draggable width
            const newPosition = Math.max(
                0,
                Math.min(clientX - rect.left - sliderHalf, maxPos)
            );

            sliderPosRef.current = newPosition;

            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(updatePosition);
            }
        },
        [isDragging, isCompleted, width]
    );

    const handleEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        setSliderPosition(sliderPosRef.current);

        const distance = Math.abs(sliderPosRef.current - puzzleX);

        if (distance <= tolerance) {
            setIsCompleted(true);
            const token = btoa(
                `${Date.now()}-${puzzleX}-${puzzleY}-${attempts}`
            );
            setTimeout(() => {
                onSuccess(token);
            }, 1500);
        } else {
            setAttempts((prev) => prev + 1);
            setTimeout(() => {
                sliderPosRef.current = 0;
                setSliderPosition(0);
            }, 250);

            if (attempts >= 2) {
                onError();
                generatePuzzle();
                setAttempts(0);
            }
        }
    }, [
        isDragging,
        puzzleX,
        tolerance,
        puzzleY,
        attempts,
        onSuccess,
        onError,
        generatePuzzle,
    ]);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => handleMove(e.clientX);
        const handlePointerUp = () => handleEnd();

        if (isDragging) {
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
        }

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDragging, handleMove, handleEnd]);

    const handlePointerDown = (e: React.PointerEvent) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        handleStart();
    };

    useEffect(() => {
        generatePuzzle();
    }, [generatePuzzle]);

    useEffect(() => {
        if (puzzleX > 0) {
            generateBackgroundImage();
        }
    }, [puzzleX, puzzleY, generateBackgroundImage]);

    // SVG path that matches the canvas drawing
    const createPuzzlePath = () => {
        const size = 40;
        const r = size * 0.2;

        return `
            M 0 0
            L ${size * 0.3} 0
            A ${r} ${r} 0 0 1 ${size * 0.7} 0
            L ${size} 0
            L ${size} ${size * 0.3}
            A ${r} ${r} 0 0 1 ${size} ${size * 0.7}
            L ${size} ${size}
            L ${size * 0.7} ${size}
            A ${r} ${r} 0 0 1 ${size * 0.3} ${size}
            L 0 ${size}
            L 0 ${size * 0.7}
            A ${r} ${r} 0 0 1 0 ${size * 0.3}
            Z
        `
            .trim()
            .replace(/\s+/g, " ");
    };

    return (
        <div className="select-none">
            <div
                ref={containerRef}
                className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
                style={{ width, height }}
            >
                {backgroundImage && (
                    <Image
                        src={backgroundImage}
                        alt="Puzzle background"
                        width={width}
                        height={height}
                        className="absolute inset-0 w-full h-full"
                        draggable={false}
                        priority={true}
                        unoptimized={true}
                    />
                )}

                <svg
                    className="absolute pointer-events-none"
                    style={{
                        left: `${sliderPosition}px`,
                        top: `${puzzleY}px`,
                        width: 50,
                        height: 50,
                        transition: isDragging ? "none" : "left 150ms ease",
                        zIndex: 10,
                    }}
                >
                    <path
                        d={createPuzzlePath()}
                        fill={isCompleted ? "#10b981" : "#6b7280"}
                        opacity={isCompleted ? "0" : "0.9"}
                    />
                </svg>

                {isCompleted && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                        <div className="text-green-900 font-bold text-xl animate-pulse text-center">
                            ✓ {t("captcha.verified")}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 relative">
                <div className="h-13 bg-gray-200 rounded-lg border-2 border-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300"></div>

                    <div
                        className={`absolute left-0 top-0 h-full ${
                            isCompleted ? "bg-green-400" : "bg-blue-400"
                        }`}
                        style={{
                            transform: `scaleX(${
                                (sliderPosition + 24) / width
                            })`,
                            transformOrigin: "left",
                            willChange: "transform",
                            transition: isDragging
                                ? "none"
                                : "transform 150ms linear",
                        }}
                    />

                    <div
                        ref={sliderRef}
                        className={`absolute top-0 h-12 w-12 rounded-md border-2 flex items-center justify-center ${
                            isCompleted
                                ? "bg-green-500 border-green-600 text-white cursor-default"
                                : isDragging
                                ? "bg-blue-500 border-blue-600 text-white shadow-lg cursor-grabbing"
                                : "bg-white border-gray-400 text-gray-600 shadow-md hover:shadow-lg cursor-grab"
                        }`}
                        style={{
                            transform: `translateX(${sliderPosition}px)`,
                            willChange: "transform",
                            transition: isDragging
                                ? "none"
                                : "transform 150ms ease",
                        }}
                        onPointerDown={
                            !isCompleted ? handlePointerDown : undefined
                        }
                    >
                        <span className="text-xl">
                            {isCompleted ? "✓" : "→"}
                        </span>
                    </div>
                </div>

                <p className="text-base text-gray-600 mt-2 text-center">
                    {isCompleted
                        ? t("captcha.verified")
                        : t("captcha.instruction")}
                </p>

                {attempts > 0 && !isCompleted && (
                    <p className="text-base text-orange-600 mt-1 text-center">
                        {t("captcha.attempt", {
                            current: attempts + 1,
                            max: 3,
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}
