import { Vector3 } from "three";
import ModelControls from "./ModelControls";

export default function AROverlayContent({
    onPlaceModel,
    isModelPlaced,
    currentHitPosition,
    qrDetected,
    qrContent,
}: {
    onPlaceModel: () => void;
    isModelPlaced: boolean;
    currentHitPosition: Vector3 | null;
    qrDetected: boolean;
    qrContent: string;
}) {
    return (
        <div className="absolute top-12 left-0 right-0 bottom-0 z-20 pointer-events-none">
            {!isModelPlaced && (
                <>
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                        <button
                            onClick={onPlaceModel}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg pointer-events-auto"
                        >
                            Place Model
                        </button>
                    </div>
                    {/* Debug info */}
                    <div className="absolute top-5 left-14 bg-black bg-opacity-50 text-white p-2 rounded pointer-events-none">
                        {currentHitPosition
                            ? `Hit: (${currentHitPosition.x.toFixed(
                                  2
                              )}, ${currentHitPosition.y.toFixed(
                                  2
                              )}, ${currentHitPosition.z.toFixed(2)})`
                            : "No hit detected"}
                        <br />
                        Status:{" "}
                        {isModelPlaced
                            ? "Model Placed"
                            : "Waiting for placement"}
                        <br />
                        QR:{" "}
                        {qrDetected
                            ? `Detected (${qrContent.substring(0, 15)}...)`
                            : "None"}
                    </div>
                </>
            )}

            <ModelControls />
        </div>
    );
}
