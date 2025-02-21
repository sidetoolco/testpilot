import { RangeInput } from "../RangeInputWithText";
import { ProductCard } from "./ProductCard";

export const ComparisonView: React.FC<{ responses: any, competitorItem: any, itemSelected: any, handleChange: (e: any) => void, handleSubmit: () => void, errors: Record<string, string> }> = ({ responses, competitorItem, itemSelected, handleChange, handleSubmit, errors }) => (
    <div className='flex flex-col items-center justify-center w-full p-6'>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full max-w-2xl">
            <div className="card bg-white p-4 rounded-lg shadow-lg w-full md:w-1/2">
                ITEM A
                <ProductCard title="Item A" item={competitorItem} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4 text-center text-2xl font-bold flex items-center justify-center">
                VS
            </div>

            <div className="card bg-white p-4 rounded-lg shadow-lg mb-4 w-full md:w-1/2">
                ITEM B
                <ProductCard title="Item B" item={itemSelected} />
            </div>
        </div>
        <div className="questions space-y-4 w-full max-w-2xl mt-4">
            <p className="font-medium">Comparado con el Item B, ¿cómo calificarías el valor del Item A?</p>
            <RangeInput name="value_comparison" value={responses.value_comparison} onChange={handleChange} />
            <p className="font-medium">Comparado con el Item B, ¿cómo calificarías el diseño y la apariencia del Item A?</p>
            <RangeInput name="appearence_comparison" value={responses.appearence_comparison} onChange={handleChange} />

            <p className="font-medium">Comparado con el Item B, ¿cómo calificarías tu confianza en que el Item A cumplirá con los resultados prometidos?</p>
            <RangeInput name="confidence_comparison" value={responses.confidence_comparison} onChange={handleChange} />

            <p className="font-medium">Comparado con el Item B, ¿cómo calificarías tu confianza en la marca del Item A?</p>
            <RangeInput name="brand_comparison" value={responses.brand_comparison} onChange={handleChange} />

            <p className="font-medium">Comparado con el Item B, ¿cómo calificarías la conveniencia del Item A?</p>
            <RangeInput name="convenience_comparison" value={responses.convenience_comparison} onChange={handleChange} />
            <div>

                <p className="font-medium">What do you like most about Item A?</p>
                <textarea
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.likes_most ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500"
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

                <p className="font-medium">What would make Item A even better?</p>
                <textarea
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.improve_suggestions ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500"
                        }`}
                    name="improve_suggestions"
                    onChange={handleChange}
                    minLength={150}
                    required
                ></textarea>
                <div className='min-h-[20px]'>
                    {errors.improve_suggestions && <div className="text-red-500 text-sm">{errors.improve_suggestions}</div>}
                </div>

            </div>
            <div>
                <p className="font-medium">What would make you choose Item B?</p>
                <textarea
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.choose_reason ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500"
                        }`}
                    name="choose_reason"
                    onChange={handleChange}
                    minLength={150}
                    required
                ></textarea>
                <div className='min-h-[20px]'>
                    {errors.choose_reason && <div className="text-red-500 text-sm">{errors.choose_reason}</div>}
                </div>
            </div>

            <button className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 w-full" onClick={handleSubmit}>Submit</button>
        </div>
    </div >
);