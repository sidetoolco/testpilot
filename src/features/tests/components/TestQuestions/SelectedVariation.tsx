import { RangeInput } from "../RangeInputWithText";
import { ProductCard } from "./ProductCard";

export const SelectedVariation: React.FC<{ item: any, handleChange: (e: any) => void, handleSubmit: () => void, errors: Record<string, string> }> = ({ item, handleChange, handleSubmit, errors }) => (
    <div className='flex flex-col items-center justify-center w-full p-3 md:p-6'>
        <div className="card bg-white p-3 rounded-lg shadow-lg mb-6 w-full max-w-md">
            <ProductCard title="Item A" item={item} />
        </div>
        <div className="questions space-y-6 w-full max-w-md">
            <p className="font-medium text-green-800">How would you rate the value of this product? (1 = Very Poor Value, 5 = Excellent Value)</p>
            <RangeInput name="value_rating" value={item.value_rating} onChange={handleChange} />

            <p className="font-medium text-green-800">How appealing do you find the design and appearance of this product? (1 = Not Appealing at All, 5 = Extremely Appealing)</p>
            <RangeInput name="appearance_rating" value={item.appearance_rating} onChange={handleChange} />

            <p className="font-medium text-green-800">How confident are you that this product will deliver its promised results? (1 = Not Confident at All, 5 = Extremely Confident)</p>
            <RangeInput name="confidence_rating" value={item.confidence_rating} onChange={handleChange} />

            <p className="font-medium text-green-800">How much do you trust this brand to meet your expectations? (1 = No Trust at All, 5 = Complete Trust)</p>
            <RangeInput name="trust_rating" value={item.trust_rating} onChange={handleChange} />

            <p className="font-medium text-green-800">How convenient does this product seem to use? (1 = Not Convenient at All, 5 = Extremely Convenient)</p>
            <RangeInput name="convenience_rating" value={item.convenience_rating} onChange={handleChange} />
            <div>

                <p className="font-medium text-green-800">What do you like most about this product?</p>
                <textarea
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${errors.likes_most ? "border-red-500 focus:ring-red-500" : "border-green-300 focus:ring-green-500"
                        }`}
                    name="likes_most"
                    onChange={handleChange}
                    minLength={150}
                    required
                ></textarea>
                <div className='min-h-[20px]'>
                    {errors.likes_most && <div className="text-red-500 text-sm">{errors.likes_most}</div>}
                </div>
            </div>
            <div>

                <p className="font-medium text-green-800">What would make this product even better? (open text)</p>
                <textarea
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${errors.improve_suggestions ? "border-red-500 focus:ring-red-500" : "border-green-300 focus:ring-green-500"
                        }`}
                    name="improve_suggestions"
                    onChange={handleChange}
                    minLength={150}
                    required
                ></textarea>
                <div className='min-h-[20px]'>

                    {errors.improve_suggestions && <div className="text-red-500 text-sm mt-0">{errors.improve_suggestions}</div>}
                </div>

            </div>
            <button className="bg-green-500 text-white p-3 rounded mt-6 hover:bg-green-600 transition duration-300 w-full" onClick={handleSubmit}>Submit</button>
        </div>
    </div>
);