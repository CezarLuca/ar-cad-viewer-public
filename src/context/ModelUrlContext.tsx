"use client";

import { createContext, useContext, ReactNode } from "react";

interface ModelUrlContextType {
    modelUrl: string;
}

const ModelUrlContext = createContext<ModelUrlContextType | undefined>(
    undefined
);

export function ModelUrlProvider({
    children,
    modelUrl,
}: {
    children: ReactNode;
    modelUrl: string;
}) {
    return (
        <ModelUrlContext.Provider value={{ modelUrl }}>
            {children}
        </ModelUrlContext.Provider>
    );
}

export function useModelUrl() {
    const context = useContext(ModelUrlContext);
    if (context === undefined) {
        throw new Error("useModelUrl must be used within a ModelUrlProvider");
    }
    return context;
}
