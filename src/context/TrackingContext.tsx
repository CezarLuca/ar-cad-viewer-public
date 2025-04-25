import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { Quaternion } from "three";

// Define the tracking data shape
interface TrackingData {
    position: [number, number, number];
    quaternion: Quaternion;
    isTracking: boolean;
}

// Default initial values
const defaultTracking: TrackingData = {
    position: [0, 0, 0],
    quaternion: new Quaternion(),
    isTracking: false,
};

const globalTrackingData = {
    data: { ...defaultTracking },
    listeners: new Set<() => void>(),

    updateTracking(updates: Partial<TrackingData>) {
        this.data = { ...this.data, ...updates };
        // Notify all listeners about the update
        this.listeners.forEach((listener) => listener());
    },

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        // Fix: Don't return the boolean result from delete
        return () => {
            this.listeners.delete(listener);
            // No return value
        };
    },
};

// Context type
interface TrackingContextType {
    tracking: TrackingData;
    updateTracking: (updates: Partial<TrackingData>) => void;
}

// Create context
const TrackingContext = createContext<TrackingContextType | undefined>(
    undefined
);

// Provider component
export function TrackingProvider({ children }: { children: ReactNode }) {
    // Use local state that syncs with the global singleton
    const [tracking, setTracking] = useState<TrackingData>(
        globalTrackingData.data
    );

    // Subscribe to changes
    useEffect(() => {
        const unsubscribe = globalTrackingData.subscribe(() => {
            setTracking({ ...globalTrackingData.data });
        });
        return unsubscribe;
    }, []);

    const updateTracking = useCallback((updates: Partial<TrackingData>) => {
        globalTrackingData.updateTracking(updates);
    }, []);

    return (
        <TrackingContext.Provider value={{ tracking, updateTracking }}>
            {children}
        </TrackingContext.Provider>
    );
}

// Custom hook to use this context
export function useTracking() {
    const context = useContext(TrackingContext);
    if (!context) {
        throw new Error("useTracking must be used within TrackingProvider");
    }
    return context;
}
