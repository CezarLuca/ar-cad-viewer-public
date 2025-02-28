"use client";

import { createContext, useContext, useState } from "react";

type ModelConfig = {
    position: [number, number, number];
    rotation: [number, number, number];
};

const ModelConfigContext = createContext<{
    config: ModelConfig;
    updateConfig: (newConfig: Partial<ModelConfig>) => void;
}>({
    config: { position: [0, 0, 0], rotation: [0, 0, 0] },
    updateConfig: () => {},
});

export function ModelConfigProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [config, setConfig] = useState<ModelConfig>({
        position: [0, 0, 0],
        rotation: [0, 0, 0],
    });

    const updateConfig = (newConfig: Partial<ModelConfig>) => {
        setConfig((prev) => ({
            ...prev,
            ...newConfig,
        }));
    };

    return (
        <ModelConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </ModelConfigContext.Provider>
    );
}

export function useModelConfig() {
    return useContext(ModelConfigContext);
}
