"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface ARContextValue {
    isARPresenting: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    enterAR: () => Promise<void>;
    exitAR: () => void;
}

const ARContext = createContext<ARContextValue>({
    isARPresenting: false,
    containerRef: { current: null },
    enterAR: async () => {},
    exitAR: () => {},
});

export const ARProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isARPresenting, setIsARPresenting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const enterAR = async () => {
        setIsARPresenting(true);
    };

    const exitAR = () => {
        setIsARPresenting(false);
    };

    return (
        <ARContext.Provider
            value={{ isARPresenting, containerRef, enterAR, exitAR }}
        >
            {children}
        </ARContext.Provider>
    );
};

export const useAR = () => useContext(ARContext);
