"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface ARContextValue {
    isARPresenting: boolean;
    setIsARPresenting: React.Dispatch<React.SetStateAction<boolean>>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const ARContext = createContext<ARContextValue>({
    isARPresenting: false,
    setIsARPresenting: () => {},
    containerRef: { current: null },
});

export const ARProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isARPresenting, setIsARPresenting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <ARContext.Provider
            value={{ isARPresenting, setIsARPresenting, containerRef }}
        >
            {children}
        </ARContext.Provider>
    );
};

export const useAR = () => useContext(ARContext);
