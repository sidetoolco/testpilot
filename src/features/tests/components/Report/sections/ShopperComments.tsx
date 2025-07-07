import React, { useState } from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import { MarkdownContent } from '../utils/MarkdownContent';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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
  testName?: string;
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

const ShopperComments: React.FC<ShopperCommentsProps> = ({ comparision, surveys, testName = 'Test' }) => {
  const { insight } = useInsightStore();
  const [isExporting, setIsExporting] = useState(false);

  const availableVariants = Object.entries(comparision)
    .filter(([_, comments]) => comments && comments.length > 0)
    .map(([variant]) => variant as 'a' | 'b' | 'c')
    .sort();

  const [variant, setVariant] = useState<'a' | 'b' | 'c' | 'summary'>('summary');

  const hasComparision = variant !== 'summary' && comparision[variant]?.length > 0;
  const hasSurveys = variant !== 'summary' && surveys[variant]?.length > 0;

  const exportCommentsToExcel = () => {
    setIsExporting(true);

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Process each variant
      ['a', 'b', 'c'].forEach(variantKey => {
        const variantComparision = comparision[variantKey as keyof typeof comparision] || [];
        const variantSurveys = surveys[variantKey as keyof typeof surveys] || [];

        // Combine all comments for this variant
        const allComments: any[] = [];

        // Add survey comments (improve_suggestions)
        variantSurveys.forEach((comment, index) => {
          allComments.push({
            'Comment Type': 'Survey - Improvement Suggestion',
            'Comment': comment.improve_suggestions || '',
            'Age': comment.tester_id?.shopper_demographic?.age || '',
            'Sex': comment.tester_id?.shopper_demographic?.sex || '',
            'Country': comment.tester_id?.shopper_demographic?.country_residence || '',
            'Index': index + 1
          });
        });

        // Add comparison comments (choose_reason)
        variantComparision.forEach((comment, index) => {
          allComments.push({
            'Comment Type': 'Comparison - Choose Reason',
            'Comment': comment.choose_reason || '',
            'Age': comment.tester_id?.shopper_demographic?.age || '',
            'Sex': comment.tester_id?.shopper_demographic?.sex || '',
            'Country': comment.tester_id?.shopper_demographic?.country_residence || '',
            'Index': index + 1
          });
        });

        // Only create sheet if there are comments
        if (allComments.length > 0) {
          const sheet = XLSX.utils.json_to_sheet(allComments);
          XLSX.utils.book_append_sheet(workbook, sheet, `Variant ${variantKey.toUpperCase()}`);
        }
      });

      // Generate and download the file
      const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_shopper_comments.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Shopper comments exported successfully');
    } catch (error) {
      console.error('Error exporting comments:', error);
      toast.error('Failed to export shopper comments');
    } finally {
      setIsExporting(false);
    }
  };

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

  // Check if there are any comments to export
  const hasAnyComments = Object.values(comparision).some(comments => comments.length > 0) ||
                        Object.values(surveys).some(comments => comments.length > 0);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Shopper comments</h2>
        {hasAnyComments && (
          <button
            onClick={exportCommentsToExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={20} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        )}
      </div>

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
