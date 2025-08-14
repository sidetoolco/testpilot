import { RangeInput } from '../RangeInputWithText';
import { ProductCard } from './ProductCard';
import { getQuestionsByIds, getQuestionText } from './questionConfig';

interface SelectedVariationProps {
  responses: any;
  item: any;
  handleChange: (e: any) => void;
  handleSubmit: () => void;
  errors: Record<string, string>;
  loading: boolean;
  selectedQuestions?: string[];
}

export const SelectedVariation: React.FC<SelectedVariationProps> = ({
  responses,
  item,
  handleChange,
  handleSubmit,
  errors,
  loading,
  selectedQuestions = ['value', 'appearance', 'confidence', 'brand', 'convenience'],
}) => {
  const questionConfigs = getQuestionsByIds(selectedQuestions);
  
  return (
  <div className="flex flex-col items-center justify-center w-full p-3 md:p-6">
    <div className="card bg-white p-3 rounded-lg shadow-lg mb-6 w-full max-w-md">
      <ProductCard title="Item A" item={item} />
    </div>
    <div className="questions space-y-6 w-full max-w-md">
      {questionConfigs.map(question => (
        <div key={question.id}>
          <p className="font-medium text-green-800">{getQuestionText(question.id, false)}</p>
          <RangeInput 
            name={question.field} 
            value={responses[question.field]} 
            onChange={handleChange} 
          />
        </div>
      ))}

      <div>
        <p className="font-medium text-green-800">What do you like most about this product?</p>
        <textarea
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
            errors.likes_most
              ? 'border-red-500 focus:ring-red-500'
              : 'border-green-300 focus:ring-green-500'
          }`}
          name="likes_most"
          value={responses.likes_most}
          onChange={handleChange}
          minLength={50}
          required
        ></textarea>
        <div className="min-h-[20px]">
          {errors.likes_most && <div className="text-red-500 text-sm">{errors.likes_most}</div>}
        </div>
      </div>
      <div>
        <p className="font-medium text-green-800">
          What would make this product even better? (open text)
        </p>
        <textarea
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
            errors.improve_suggestions
              ? 'border-red-500 focus:ring-red-500'
              : 'border-green-300 focus:ring-green-500'
          }`}
          name="improve_suggestions"
          value={responses.improve_suggestions}
          onChange={handleChange}
          minLength={50}
          required
        ></textarea>
        <div className="min-h-[20px]">
          {errors.improve_suggestions && (
            <div className="text-red-500 text-sm mt-0">{errors.improve_suggestions}</div>
          )}
        </div>
      </div>
      <button
        className="bg-green-500 text-white p-3 rounded mt-6 hover:bg-green-600 transition duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  </div>
  );
};
