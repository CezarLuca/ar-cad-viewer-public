import ModelControls from "./ModelControls";

export default function AROverlayContent({
    isModelPlaced,
}: {
    isModelPlaced: boolean;
}) {
    return (
        <div className="absolute top-12 left-0 right-0 bottom-0 z-20 pointer-events-none">
            {!isModelPlaced && (
                <>
                    {/* Debug info */}
                    <div className="absolute top-5 left-14 bg-black bg-opacity-50 text-white p-2 rounded pointer-events-none">
                        Status:{" "}
                        {isModelPlaced
                            ? "Model Placed"
                            : "Waiting for placement"}
                    </div>
                </>
            )}

            <ModelControls />
        </div>
    );
}
