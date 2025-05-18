"use client";

import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const words = [
    { text: "Ideas", imgPath: "/images/ideas.svg" },
    { text: "Concepts", imgPath: "/images/concepts.svg" },
    { text: "Designs", imgPath: "/images/designs.svg" },
    { text: "Models", imgPath: "/images/code.svg" },
];
const HeroSection = () => {
    useGSAP(() => {
        gsap.fromTo(
            ".hero-text h1",
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.2,
                duration: 1,
                ease: "power2.inOut",
            }
        );
    });

    return (
        <div className="max-w-3xl text-center mb-2">
            <section className="relative overflow-hidden p-1 pb-11 rounded-lg mb-1">
                <div className="relative z-10 xl:mt-20 mt-32 flex items-start justify-center">
                    <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
                        <div className="flex flex-col gap-7 dark:text-gray-50 text-gray-800 text-shadow-md text-shadow-gray-600">
                            <div className="hero-text flex flex-col justify-center md:text-[60px] text-[30px] font-semibold relative z-10 pointer-events-none">
                                <h1>AR Web Viewer</h1>
                                <h1>Upload and Visualize</h1>
                                <h1>
                                    Your 3D{" "}
                                    <span className="slide">
                                        <span className="wrapper">
                                            {words.map((word) => (
                                                <span
                                                    key={word.text}
                                                    className="flex items-center md:gap-3 gap-1 pb-2"
                                                >
                                                    <Image
                                                        width={40}
                                                        height={40}
                                                        src={word.imgPath}
                                                        alt={word.text}
                                                        className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-gray-100/40 object-contain"
                                                    />
                                                    <span>{word.text}</span>
                                                </span>
                                            ))}
                                        </span>
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </header>
                </div>
                <div className="flex justify-center space-x-4 mt-8">
                    <Link
                        href="/auth/login"
                        className="bg-gray-600/70 text-gray-50 px-6 py-3 rounded-lg hover:bg-gray-800/50 border-2 border-gray-400 hover:border-gray-200 shadow-md shadow-gray-400/30 transition-colors text-2xl"
                    >
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HeroSection;
