import { RangeInput } from '../RangeInputWithText';
import { ProductCard } from './ProductCard';
import { getQuestionsByIds, getQuestionText } from './questionConfig';

interface ComparisonViewProps {
  responses: any;
  competitorItem: any;
  itemSelected: any;
  handleChange: (e: any) => void;
  handleSubmit: () => void;
  errors: Record<string, string>;
  loading: boolean;
  selectedQuestions?: string[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  responses,
  competitorItem,
  itemSelected,
  handleChange,
  handleSubmit,
  errors,
  loading,
  selectedQuestions = ['value', 'appearance', 'confidence', 'brand', 'convenience'],
}) => {
  const questionConfigs = getQuestionsByIds(selectedQuestions);
  
  return (
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
      {questionConfigs.map(question => (
        <div key={question.id}>
          <p className="font-medium">{getQuestionText(question.id, true)}</p>
          <RangeInput 
            name={question.field} 
            value={responses[question.field]} 
            onChange={handleChange} 
          />
        </div>
      ))}

      <div>
        <p className="font-medium">What do you like most about Item B?</p>
        <textarea
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.likes_most
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-500'
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
        <p className="font-medium">What would make Item B even better?</p>
        <textarea
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.improve_suggestions
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-500'
          }`}
          name="improve_suggestions"
          value={responses.improve_suggestions}
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
          value={responses.choose_reason}
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
};
