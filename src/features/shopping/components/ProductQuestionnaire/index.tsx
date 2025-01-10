import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../../../types';
import { questions } from './questions';

interface ProductQuestionnaireProps {
  product: Product;
  onClose: () => void;
}

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
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
            {/* Question rendering logic here */}
          </div>
        </div>

        <div className="p-6 border-t">
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