import { useState } from "react";

export const RangeInput: React.FC<{ name: string, value: number, onChange: (e: any) => void }> = ({ name, value, onChange }) => {
    const labels = [
        { text: 'Much Worse', color: 'text-red-600', value: 1 },
        { text: 'Worse', color: 'text-orange-600', value: 2 },
        { text: 'Equal', color: 'text-gray-600', value: 3 },
        { text: 'Better', color: 'text-yellow-600', value: 4 },
        { text: 'Much Better', color: 'text-green-600', value: 5 },
    ];

    const inputColor = labels.find(label => label.value === value)?.color || 'text-gray-600';

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipValue, setTooltipValue] = useState(value);

    const handleMouseEnter = () => {
        setTooltipVisible(true);
    };

    const handleMouseLeave = () => {
        setTooltipVisible(false);
    };

    const handleChange = (e: any) => {
        onChange(e);
        setTooltipValue(e.target.value);
    };

    return (
        <div className="flex flex-col items-center w-full py-2">
            <div className="relative w-full">
                <input
                    type="range"
                    min="1"
                    max="5"
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={`w-full h-3 rounded-lg cursor-pointer ${inputColor}`}
                />
                {tooltipVisible && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-sm rounded px-1 py-0.5">
                        {tooltipValue}
                    </div>
                )}
                <div className="flex justify-around w-full mt-1">
                    {labels.map((label, index) => (
                        <small key={index} className={`text-sm ${label.color}`}>
                            {label.text}
                        </small>
                    ))}
                </div>
            </div>
        </div>
    );
};