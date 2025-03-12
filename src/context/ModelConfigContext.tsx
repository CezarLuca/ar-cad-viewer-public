import { createContext, useContext, useState } from "react";
// import { Vector3 } from "three";

// Define the shape of your model configuration
interface ModelConfig {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}

// Default initial values
const defaultConfig: ModelConfig = {
    position: [0, 0, 0], // Start at origin
    rotation: [0, 0, 0],
    scale: [0.01, 0.01, 0.01],
};

// Context type
interface ModelConfigContextType {
    config: ModelConfig;
    updateConfig: (updates: Partial<ModelConfig>) => void;
}

// Create context with initial values
const ModelConfigContext = createContext<ModelConfigContextType | undefined>(
    undefined
);

// Provider component
export function ModelConfigProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [config, setConfig] = useState<ModelConfig>(defaultConfig);

    const updateConfig = (updates: Partial<ModelConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    return (
        <ModelConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </ModelConfigContext.Provider>
    );
}

// Custom hook to use this context
export function useModelConfig() {
    const context = useContext(ModelConfigContext);
    if (!context) {
        throw new Error(
            "useModelConfig must be used within ModelConfigProvider"
        );
    }
    return context;
}
