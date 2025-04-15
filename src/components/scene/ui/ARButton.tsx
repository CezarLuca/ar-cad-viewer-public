import React from "react";

interface ARButtonProps {
    onClick: () => void;
    currentSession: XRSession | null;
}

const ARButton: React.FC<ARButtonProps> = ({ onClick, currentSession }) => {
    return (
        <button
            onClick={onClick}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded z-20"
        >
            {currentSession ? "EXIT AR" : "ENTER AR"}
        </button>
    );
};

export default ARButton;
