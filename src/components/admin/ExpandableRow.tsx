"use client";

import { useState, useEffect } from "react";

interface FieldInfo {
    label: string;
    value: React.ReactNode;
}

interface ExpandableRowProps {
    hiddenFields: {
        sm: FieldInfo[];
        md: FieldInfo[];
    };
    isOpen: boolean;
    tableType: "users" | "models"; // Identify which table we're in
}

export default function ExpandableRow({
    hiddenFields,
    isOpen,
    tableType,
}: ExpandableRowProps) {
    const [fields, setFields] = useState<FieldInfo[]>([]);
    const [columnSpan, setColumnSpan] = useState(6);

    useEffect(() => {
        // Handle responsive behavior on client side
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 640;
            const isMediumScreen = window.innerWidth < 768;

            // Calculate visible fields
            const visibleFields = [
                ...(isSmallScreen ? hiddenFields.sm : []),
                ...(isMediumScreen ? hiddenFields.md : []),
            ];
            setFields(visibleFields);

            // Calculate appropriate colSpan based on screen size and table type
            if (tableType === "users") {
                if (isSmallScreen) {
                    setColumnSpan(4); // ID, Name, Role, Actions
                } else if (isMediumScreen) {
                    setColumnSpan(5); // ID, Name, Email, Role, Actions
                } else {
                    setColumnSpan(6); // All columns
                }
            } else if (tableType === "models") {
                if (isSmallScreen) {
                    setColumnSpan(3); // ID, Name, Actions
                } else if (isMediumScreen) {
                    setColumnSpan(5); // ID, Name, User, Size, Actions
                } else {
                    setColumnSpan(6); // All columns
                }
            }
        };

        // Initial check
        handleResize();

        // Listen for window resize
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [hiddenFields, tableType]);

    if (!isOpen || fields.length === 0) return null;

    return (
        <tr className="bg-gray-50 border-b border-gray-300">
            <td colSpan={columnSpan} className="py-2 sm:py-3 px-2 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm transition-all duration-200 ease-in-out">
                    {fields.map((field, index) => (
                        <div key={index} className="flex flex-col py-1">
                            <span className="font-semibold text-gray-700">
                                {field.label}:
                            </span>
                            <span className="text-gray-600">{field.value}</span>
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );
}
