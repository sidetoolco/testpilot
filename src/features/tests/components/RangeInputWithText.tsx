export const RangeInput: React.FC<{ name: string, value: number, onChange: (e: any) => void }> = ({ name, value, onChange }) => {
    const labels = [
        { text: 'Much Worse', color: 'text-red-600', value: 1 },
        { text: 'Worse', color: 'text-orange-600', value: 2 },
        { text: 'Equal', color: 'text-gray-600', value: 3 },
        { text: 'Better', color: 'text-yellow-600', value: 4 },
        { text: 'Much Better', color: 'text-green-600', value: 5 },
    ];

    const handleChange = (e: any) => {
        onChange(e);
    };

    return (
        <div className="flex flex-col items-center w-full py-2">
            <div className="relative w-full">
                <div className="flex justify-around w-full">
                    {labels.map((label, index) => (
                        <label key={index} className="flex flex-row md:flex-col items-center">
                            <input
                                type="radio"
                                name={name}
                                value={label.value}
                                checked={value === label.value}
                                onChange={handleChange}
                            />
                            <span className={`text-sm ${label.color}`}>{label.text}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};