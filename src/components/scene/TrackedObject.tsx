import React, { useEffect, useRef } from "react";
import { Object3D, Group, Euler, Quaternion } from "three";
import { useModelConfig } from "@/context/ModelConfigContext";
import { useTracking } from "@/context/TrackingContext";

const POSITION_SCALE = 0.1;
const SIZE_SCALE = 0.1;

interface TrackedObjectProps {
    object: React.RefObject<Group | Object3D | null>;
}

export const TrackedObject: React.FC<TrackedObjectProps> = ({ object }) => {
    const { config } = useModelConfig();
    const { tracking } = useTracking();
    const prevTrackingRef = useRef(tracking);

    useEffect(() => {
        if (!object.current) return;

        // Skip updates if tracking status hasn't changed and not tracking
        if (
            !tracking.isTracking &&
            prevTrackingRef.current.isTracking === tracking.isTracking
        ) {
            return;
        }

        prevTrackingRef.current = tracking;

        if (tracking.isTracking) {
            // Combine user config with tracking data
            const finalPosition = [
                config.position[0] * POSITION_SCALE + tracking.position[0],
                config.position[1] * POSITION_SCALE + tracking.position[1],
                config.position[2] * POSITION_SCALE + tracking.position[2],
            ];

            // For rotation, combine tracking quaternion with user rotation
            const userRotation = new Euler(
                config.rotation[0],
                config.rotation[1],
                config.rotation[2]
            );
            const userQuaternion = new Quaternion().setFromEuler(userRotation);
            const finalQuaternion = tracking.quaternion
                .clone()
                .multiply(userQuaternion);

            // Apply the combined transforms to the object
            object.current.position.set(
                finalPosition[0],
                finalPosition[1],
                finalPosition[2]
            );
            object.current.quaternion.copy(finalQuaternion);
            object.current.scale.set(
                config.scale[0] * SIZE_SCALE,
                config.scale[1] * SIZE_SCALE,
                config.scale[2] * SIZE_SCALE
            );
        }
    }, [config, tracking, object]);

    return null; // This is a logic component, not a visual one
};
