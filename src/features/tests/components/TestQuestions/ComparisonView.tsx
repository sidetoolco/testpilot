import { RangeInput } from '../RangeInputWithText';
import { ProductCard } from './ProductCard';

interface ComparisonViewProps {
  responses: any;
  competitorItem: any;
  itemSelected: any;
  handleChange: (e: any) => void;
  handleSubmit: () => void;
  errors: Record<string, string>;
  loading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  responses,
  competitorItem,
  itemSelected,
  handleChange,
  handleSubmit,
  errors,
  loading,
}) => (
  <div className="flex flex-col items-center justify-center w-full p-6">
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
      <p className="font-medium">Compared to Item B, how would you rate the value of Item A?</p>
      <RangeInput name="value" value={responses.value} onChange={handleChange} />

      <p className="font-medium">
        Compared to Item B, how would you rate the design and appearance of Item A?
      </p>
      <RangeInput name="appearence" value={responses.appearence} onChange={handleChange} />

      <p className="font-medium">
        Compared to Item B, how would you rate your confidence that Item A will deliver the promised
        results?
      </p>
      <RangeInput name="confidence" value={responses.confidence} onChange={handleChange} />

      <p className="font-medium">
        Compared to Item B, how would you rate the convenience of Item A?
      </p>
      <RangeInput name="convenience" value={responses.convenience} onChange={handleChange} />

      <p className="font-medium">
        Compared to Item B, how would you rate your trust in the brand of Item A?
      </p>
      <RangeInput name="brand" value={responses.brand} onChange={handleChange} />

      <div>
        <p className="font-medium">What do you like most about Item B?</p>
        <textarea
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.likes_most
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-500'
          }`}
          name="likes_most"
          onChange={handleChange}
          minLength={50}
          required
        ></textarea>
        <div className="min-h-[20px]">
          {errors.likes_most && <div className="text-red-500 text-sm">{errors.likes_most}</div>}
        </div>
      </div>
      <div>
        <p className="font-medium">What would make Item B even better?</p>
        <textarea
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.improve_suggestions
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-500'
          }`}
          name="improve_suggestions"
          onChange={handleChange}
          minLength={50}
          required
        ></textarea>
        <div className="min-h-[20px]">
          {errors.improve_suggestions && (
            <div className="text-red-500 text-sm">{errors.improve_suggestions}</div>
          )}
        </div>
      </div>
      <div>
        <p className="font-medium">What would make you choose Item A?</p>
        <textarea
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.choose_reason
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-500'
          }`}
          name="choose_reason"
          onChange={handleChange}
          minLength={50}
          required
        ></textarea>
        <div className="min-h-[20px]">
          {errors.choose_reason && (
            <div className="text-red-500 text-sm">{errors.choose_reason}</div>
          )}
        </div>
      </div>

      <button
        className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={loading}
      >
        Submit
      </button>
    </div>
  </div>
);
