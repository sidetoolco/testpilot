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
        <div className="flex justify-around flex-col md:flex-row items-start w-full">
            {labels.map((label, index) => (
                <label key={index} className="flex md:flex-col flex-row md:items-center justify-items-center space-y-1 md:space-y-0 md:space-x-2">
                    <input
                        type="radio"
                        name={name}
                        value={label.value}
                        checked={value === label.value}
                        onChange={handleChange}
                        className="form-radio"
                    />
                    <span className={`md:text-sm text-base md:ml-0 ml-2 ${label.color}`}>{label.text}</span>
                </label>
            ))}
        </div>
    );
};