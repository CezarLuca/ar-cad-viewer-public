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
}

export default function ExpandableRow({
    hiddenFields,
    isOpen,
}: ExpandableRowProps) {
    const [fields, setFields] = useState<FieldInfo[]>([]);

    useEffect(() => {
        // Handle responsive behavior on client side
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 640;
            const isMediumScreen = window.innerWidth < 768;

            const visibleFields = [
                ...(isSmallScreen ? hiddenFields.sm : []),
                ...(isMediumScreen ? hiddenFields.md : []),
            ];

            setFields(visibleFields);
        };

        // Initial check
        handleResize();

        // Listen for window resize
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [hiddenFields]);

    if (!isOpen || fields.length === 0) return null;

    return (
        <tr className="bg-gray-50">
            <td colSpan={100} className="py-4 px-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {fields.map((field, index) => (
                        <div key={index} className="flex flex-col">
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
