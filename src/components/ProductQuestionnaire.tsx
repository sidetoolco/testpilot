import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ProductQuestionnaireProps {
  product: Product;
  onClose: () => void;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'rating' | 'select' | 'price' | 'yesno';
  options?: string[];
  followUp?: {
    condition: boolean | string;
    question: string;
  };
}

const questions: Question[] = [
  {
    id: 'motivation',
    text: 'What motivated you to add this product to your cart?',
    type: 'text'
  },
  {
    id: 'likes',
    text: 'What do you like most about this product?',
    type: 'text'
  },
  {
    id: 'dislikes',
    text: 'Is there anything about this product that you dislike or are unsure about?',
    type: 'text'
  },
  {
    id: 'price_perception',
    text: 'How do you feel about the price of this product?',
    type: 'select',
    options: ['Too Low', 'Fair', 'Too High']
  },
  {
    id: 'comparison',
    text: 'How does this product compare to similar products you\'ve considered?',
    type: 'text'
  },
  {
    id: 'purchase_intent',
    text: 'On a scale of 1 to 5, how likely are you to purchase this product in real life?',
    type: 'rating'
  },
  {
    id: 'influential_features',
    text: 'Were there specific features or information that influenced your decision to add this product to your cart?',
    type: 'text'
  },
  {
    id: 'information_clarity',
    text: 'Did you find the product information clear and helpful?',
    type: 'yesno',
    followUp: {
      condition: false,
      question: 'Please specify what was confusing or missing.'
    }
  },
  {
    id: 'suggestions',
    text: 'Do you have any suggestions on how this product could be improved?',
    type: 'text'
  },
  {
    id: 'emotional_response',
    text: 'How does this product make you feel?',
    type: 'text'
  },
  {
    id: 'recommendation',
    text: 'Would you recommend this product to a friend or family member?',
    type: 'yesno',
    followUp: {
      condition: true,
      question: 'Why would you recommend it?'
    }
  },
  {
    id: 'brand_perception',
    text: 'What is your perception of the brand offering this product?',
    type: 'text'
  },
  {
    id: 'packaging_feedback',
    text: 'What are your thoughts on the product\'s packaging and design?',
    type: 'text'
  },
  {
    id: 'price_too_expensive',
    text: 'At what price point would you consider this product to be too expensive?',
    type: 'price'
  },
  {
    id: 'considered_alternatives',
    text: 'Did you consider any alternative products before adding this one to your cart?',
    type: 'yesno',
    followUp: {
      condition: true,
      question: 'What made you choose this product over others?'
    }
  }
];

export default function ProductQuestionnaire({ product, onClose }: ProductQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFollowUp, setShowFollowUp] = useState<Record<string, boolean>>({});

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    const question = questions.find(q => q.id === questionId);
    if (question?.followUp) {
      setShowFollowUp(prev => ({
        ...prev,
        [questionId]: answer === question.followUp?.condition
      }));
    }
  };

  const handleFollowUpAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [`${questionId}_followup`]: answer
    }));
  };

  const handleSubmit = () => {
    // Here you would typically save the answers
    console.log('Answers:', answers);
    onClose();
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary-400"
            rows={4}
            placeholder="Type your answer here..."
          />
        );

      case 'rating':
        return (
          <div className="flex justify-center space-x-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(question.id, value)}
                className={`w-12 h-12 rounded-full ${
                  answers[question.id] === value
                    ? 'bg-primary-400 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                } flex items-center justify-center text-lg font-medium transition-colors`}
              >
                {value}
              </button>
            ))}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full p-3 rounded-lg border ${
                  answers[question.id] === option
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } transition-colors`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'price':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 pl-8 focus:ring-2 focus:ring-primary-400"
              placeholder="0.00"
            />
          </div>
        );

      case 'yesno':
        return (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => handleAnswer(question.id, true)}
                className={`flex-1 p-3 rounded-lg border ${
                  answers[question.id] === true
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } transition-colors`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(question.id, false)}
                className={`flex-1 p-3 rounded-lg border ${
                  answers[question.id] === false
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } transition-colors`}
              >
                No
              </button>
            </div>
            {showFollowUp[question.id] && question.followUp && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{question.followUp.question}</p>
                <textarea
                  value={answers[`${question.id}_followup`] || ''}
                  onChange={(e) => handleFollowUpAnswer(question.id, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary-400"
                  rows={3}
                  placeholder="Type your answer here..."
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Product Feedback</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2">
            <div className="h-1 bg-gray-100 rounded-full">
              <div
                className="h-1 bg-primary-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQ.text}</h3>
            {renderQuestion(currentQ)}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}