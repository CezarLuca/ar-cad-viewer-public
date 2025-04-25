import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
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

// Create a singleton store for model config that exists outside React
// This allows sharing state between different React trees
const globalModelConfig = {
    config: { ...defaultConfig },
    listeners: new Set<() => void>(),

    updateConfig(updates: Partial<ModelConfig>) {
        this.config = { ...this.config, ...updates };
        // Notify all listeners about the update
        this.listeners.forEach((listener) => listener());
    },

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    },
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
    initialConfig,
}: {
    children: React.ReactNode;
    initialConfig?: Partial<ModelConfig>;
}) {
    // Use useRef to track if we've initialized with props
    const initializedRef = useRef(false);

    // Use local state that syncs with the global singleton
    const [config, setConfig] = useState<ModelConfig>(globalModelConfig.config);

    // Only initialize once on mount if initialConfig is provided
    useEffect(() => {
        if (initialConfig && !initializedRef.current) {
            globalModelConfig.updateConfig(initialConfig);
            initializedRef.current = true;
        }
    }, [initialConfig]);

    // Subscribe to changes
    useEffect(() => {
        const unsubscribe = globalModelConfig.subscribe(() => {
            setConfig({ ...globalModelConfig.config });
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const updateConfig = useCallback((updates: Partial<ModelConfig>) => {
        globalModelConfig.updateConfig(updates);
    }, []);

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
