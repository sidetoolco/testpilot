import { useState } from 'react';
import ModalLayout from '../../../../layouts/ModalLayout';
import { Rating } from 'react-simple-star-rating';
import { supabase } from '../../../../lib/supabase';

interface IProps {
  handleSubmit: () => void;
  handleModalClose: () => void;
  isSelectedVariation: boolean;
  isOpen: boolean;
}

const FeedbackModal: React.FC<IProps> = ({
  handleSubmit,
  isSelectedVariation,
  handleModalClose,
  isOpen,
}) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    rating: 0,
    comment: '',
  });

  const handleInputChange = (key: 'rating' | 'comment', value: string | number) => {
    setInput(prevInput => ({
      ...prevInput,
      [key]: value,
    }));
  };

  const handleFeedbackSubmit = async () => {
    if (!input.rating || !input.comment.trim().length || loading) return;

    setLoading(true);

    // If it can save the feedback on Supabase, great. If not, let's continue with the workflow
    try {
      await supabase.from('feedback').insert(input as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      handleSubmit();
    }
  };

  const submitBtnClassnames = isSelectedVariation
    ? 'bg-green-500 text-white p-3 rounded mt-6 hover:bg-green-600 transition duration-300 w-full'
    : 'bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 w-full';

  return (
    <ModalLayout isOpen={isOpen} onClose={handleModalClose} title="Your Feedback">
      <Rating
        allowFraction
        onClick={newRating => handleInputChange('rating', newRating)}
        initialValue={input.rating}
      />
      <div className="space-y-2 mt-4">
        <p className={`font-medium ${isSelectedVariation ? 'text-green-800' : 'text-gray-700'}`}>
          Share your suggestions for improvement
        </p>
        <textarea
          className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 min-h-[120px] resize-y ${
            isSelectedVariation
              ? 'border-green-300 focus:ring-green-500'
              : 'border-gray-300 focus:ring-gray-500'
          }`}
          name="improve_suggestions"
          value={input.comment}
          onChange={({ target }) => handleInputChange('comment', target.value)}
          placeholder="Tell us what we can do better..."
          required
        />
      </div>

      <button
        onClick={handleFeedbackSubmit}
        className={`${submitBtnClassnames} disabled:cursor-not-allowed disabled:opacity-70`}
        disabled={!input.comment.trim().length || !input.rating || loading}
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </ModalLayout>
  );
};

export default FeedbackModal;
