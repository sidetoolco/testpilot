import React, { useState } from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import { MarkdownContent } from '../utils/MarkdownContent';

interface Comment {
  likes_most?: string;
  improve_suggestions?: string;
  choose_reason?: string;
  tester_id: {
    shopper_demographic: {
      age: null | number;
      sex: null | string;
      country_residence: null | string;
    };
  };
}

interface ShopperCommentsProps {
  comparision: {
    a: Comment[];
    b: Comment[];
    c: Comment[];
  };
  surveys: {
    a: Comment[];
    b: Comment[];
    c: Comment[];
  };
}

const CommentSection: React.FC<{
  title: string;
  comments: Comment[];
  field: keyof Comment;
}> = ({ title, comments, field }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
    {comments.length > 0 ? (
      <div className="grid grid-cols-2 gap-4">
        {comments.map((comment, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border justify-between flex flex-col italic bg-gray-50`}
          >
            <p className="text-gray-700">
              {typeof comment[field] === 'string' ? comment[field] : ''}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {comment.tester_id?.shopper_demographic?.age && (
                <p>Age: {comment.tester_id.shopper_demographic.age}</p>
              )}
              {comment.tester_id?.shopper_demographic?.sex && (
                <p>Sex: {comment.tester_id.shopper_demographic.sex}</p>
              )}
              {comment.tester_id?.shopper_demographic?.country_residence && (
                <p>Country: {comment.tester_id.shopper_demographic.country_residence}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No comments available.</p>
    )}
  </div>
);

const ShopperComments: React.FC<ShopperCommentsProps> = ({ comparision, surveys }) => {
  const { insight } = useInsightStore();

  const availableVariants = Object.entries(comparision)
    .filter(([_, comments]) => comments && comments.length > 0)
    .map(([variant]) => variant as 'a' | 'b' | 'c')
    .sort();

  const [variant, setVariant] = useState<'a' | 'b' | 'c' | 'summary'>('summary');

  const hasComparision = variant !== 'summary' && comparision[variant]?.length > 0;
  const hasSurveys = variant !== 'summary' && surveys[variant]?.length > 0;

  if (variant !== 'summary' && !hasComparision && !hasSurveys) {
    return (
      <div className="h-80 flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopper Comments</h2>
        <div className="mb-6 flex items-center justify-center space-x-3">
          {availableVariants.map(v => (
            <button
              key={`variant-btn-${v}`}
              onClick={() => setVariant(v)}
              className={`px-6 py-2 rounded font-medium transition-colors
                                ${
                                  variant === v
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-green-200 text-black hover:bg-gray-400'
                                }`}
            >
              Variant {v.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-center">
          No comments available for variant {variant.toUpperCase()}
        </p>
      </div>
    );
  }

  const currentComparision = variant === 'summary' ? [] : comparision[variant];
  const currentSurveys = variant === 'summary' ? [] : surveys[variant];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">Shopper comments</h2>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setVariant('summary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                'summary' === variant
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Summary
            </button>
            {availableVariants.map(v => (
              <button
                key={`variant-btn-${v}`}
                onClick={() => setVariant(v)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  v === variant
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Variant {v.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {variant === 'summary' && <MarkdownContent content={insight.comment_summary} />}

      {hasSurveys && (
        <div className="mb-8">
          <CommentSection
            title={`Suggested improvement for your buyers (${currentSurveys.length})`}
            comments={currentSurveys}
            field="improve_suggestions"
          />
        </div>
      )}

      {hasComparision && (
        <div>
          <CommentSection
            title={`Suggested improvements from competitive buyers (${currentComparision.length})`}
            comments={currentComparision}
            field="choose_reason"
          />
        </div>
      )}
    </div>
  );
};

export default ShopperComments;
