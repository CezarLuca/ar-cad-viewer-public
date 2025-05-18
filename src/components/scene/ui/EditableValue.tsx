import { useState } from "react";

const EditableValue = ({
    value,
    onValueChange,
    fieldId,
    suffix = "",
    min,
    max,
    step = 0.01,
    toFixed = 2,
    disabled = false,
}: {
    value: number;
    onValueChange: (value: number) => void;
    fieldId: string;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
    toFixed?: number;
    disabled?: boolean;
}) => {
    const [editingField, setEditingField] = useState<string | null>(null);
    const isEditing = editingField === fieldId;
    const [inputValue, setInputValue] = useState(value.toFixed());

    const handleClick = () => {
        setInputValue(value.toFixed(toFixed));
        setEditingField(fieldId);
    };

    const handleBlur = () => {
        const newValue = parseFloat(inputValue);
        if (!isNaN(newValue)) {
            const clampedValue =
                min !== undefined && max !== undefined
                    ? Math.min(Math.max(newValue, min), max)
                    : newValue;
            onValueChange(clampedValue);
        }
        setEditingField(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleBlur();
        } else if (e.key === "Escape") {
            // setInputValue(value.toFixed(toFixed));
            setEditingField(null);
        }
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-12 text-right text-xs bg-white border-blue-300 rounded px-1"
                autoFocus
                step={step}
            />
        );
    }

    return (
        <span
            onClick={handleClick}
            className="cursor-pointer hover:text-blue-600 hover:underline"
            aria-disabled={disabled}
        >
            {value.toFixed(toFixed)}
            {suffix}
        </span>
    );
};

export default EditableValue;
