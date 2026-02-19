import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import { MarkdownContent } from '../utils/MarkdownContent';
import ChosenProductCard, { Product } from './ChosenProductCard';

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
  products?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  };
  amazon_products?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  };
  walmart_products?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  };
  competitor_id?: string;
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
  testData?: {
    competitors: Array<{ id: string; title: string; image_url: string; price: number }>;
    variations: {
      a: { id: string; title: string; image_url: string; price: number } | null;
      b: { id: string; title: string; image_url: string; price: number } | null;
      c: { id: string; title: string; image_url: string; price: number } | null;
    };
  };
}

const getChosenProduct = (
  comment: Comment,
  testData?: ShopperCommentsProps['testData']
): Product | null => {
  if (comment.competitor_id) {
    return testData?.competitors.find(comp => comp.id === comment.competitor_id) || null;
  } else {
    // Check for both amazon_products and walmart_products
    return comment.products || comment.amazon_products || comment.walmart_products || null;
  }
};

const sortCommentsByCompetitorPopularity = (
  comments: Comment[],
  testData?: ShopperCommentsProps['testData']
): Comment[] => {
  const competitorCounts: { [competitorId: string]: number } = {};

  comments.forEach(comment => {
    if (comment.competitor_id) {
      competitorCounts[comment.competitor_id] = (competitorCounts[comment.competitor_id] || 0) + 1;
    }
  });

  return [...comments].sort((a, b) => {
    const aCount = a.competitor_id ? competitorCounts[a.competitor_id] || 0 : 0;
    const bCount = b.competitor_id ? competitorCounts[b.competitor_id] || 0 : 0;

    if (aCount !== bCount) {
      return bCount - aCount;
    }

    const aProduct = getChosenProduct(a, testData);
    const bProduct = getChosenProduct(b, testData);
    const aName = aProduct?.title || '';
    const bName = bProduct?.title || '';

    return aName.localeCompare(bName);
  });
};

// Question mapping for different comment fields
const getQuestionForField = (field: keyof Comment): string => {
  switch (field) {
    case 'likes_most':
      return 'What do you like most about this product?';
    case 'improve_suggestions':
      return 'What suggestions do you have to improve this product?';
    case 'choose_reason':
      return 'What would make you choose our product (Item A) over the selected competitor (Item B)?';
    default:
      return 'Question not available';
  }
};

const CommentItem: React.FC<{
  comment: Comment;
  field: keyof Comment;
  testData?: ShopperCommentsProps['testData'];
  onProductClick: (product: Product) => void;
  competitorCounts?: { [competitorId: string]: number };
  index: number;
  showQuestions?: boolean;
}> = React.memo(({ comment, field, testData, onProductClick, competitorCounts, index, showQuestions = true }) => {
  const chosenProduct = getChosenProduct(comment, testData);
  const isCompetitor = !!comment.competitor_id;
  const count = comment.competitor_id ? competitorCounts?.[comment.competitor_id] : undefined;
  const question = getQuestionForField(field);
  const answer = typeof comment[field] === 'string' ? comment[field] : '';
  const hasAnswer = answer && answer.trim() !== '';

  return (
    <div
      className={`p-4 rounded-lg border justify-between flex flex-col italic bg-gray-50`}
    >
      {chosenProduct && (
        <ChosenProductCard
          product={chosenProduct}
          isCompetitor={isCompetitor}
          onProductClick={onProductClick}
          count={count}
        />
      )}

      {showQuestions && hasAnswer && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 not-italic">
            <span className="font-semibold">Q:</span> {question}
          </p>
          <p className="text-gray-700 italic">
            <span className="font-semibold not-italic">A:</span> {answer}
          </p>
        </div>
      )}

      {!showQuestions && hasAnswer && (
        <p className="text-gray-700">{answer}</p>
      )}

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
  );
});

CommentItem.displayName = 'CommentItem';

const CommentSection: React.FC<{
  title: string;
  comments: Comment[];
  field: keyof Comment;
  testData?: ShopperCommentsProps['testData'];
  onProductClick: (product: Product) => void;
  sortByCompetitor?: boolean;
  showQuestions?: boolean;
}> = React.memo(
  ({ title, comments, field, testData, onProductClick, sortByCompetitor = false, showQuestions = true }) => {
    const { sortedComments, competitorCounts } = useMemo(() => {
      const sorted = sortByCompetitor
        ? sortCommentsByCompetitorPopularity(comments, testData)
        : comments;

      const counts: { [competitorId: string]: number } = {};
      if (sortByCompetitor) {
        comments.forEach(comment => {
          if (comment.competitor_id) {
            counts[comment.competitor_id] = (counts[comment.competitor_id] || 0) + 1;
          }
        });
      }

      return { sortedComments: sorted, competitorCounts: counts };
    }, [comments, testData, sortByCompetitor]);

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        {sortedComments.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            
            {sortedComments.map((comment, index) => {
              const productId =
                comment.products?.id ||
                comment.amazon_products?.id ||
                comment.walmart_products?.id ||
                comment.tiktok_products?.id ||
                comment.competitor_id ||
                '';
              const testerId = comment.tester_id ? JSON.stringify(comment.tester_id) : '';
              return (
                <CommentItem
                  key={`comment-${productId}-${testerId}-${index}`}
                  comment={comment}
                  field={field}
                  testData={testData}
                  onProductClick={onProductClick}
                  competitorCounts={competitorCounts}
                  index={index}
                  showQuestions={showQuestions}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No comments available.</p>
        )}
      </div>
    );
  }
);

CommentSection.displayName = 'CommentSection';

const getStableKey = (comment: Comment, prefix: string, index: number): string => {
  const productId = comment.products?.id || comment.amazon_products?.id || comment.walmart_products?.id || '';
  const testerId = comment.tester_id ? JSON.stringify(comment.tester_id) : '';
  return `${prefix}-${productId}-${testerId}-${index}`;
};

const MergedBuyersSection: React.FC<{
  title: string;
  buyersWithComments: Comment[];
  buyersWithoutComments: Comment[];
  testData?: ShopperCommentsProps['testData'];
  onProductClick: (product: Product) => void;
}> = React.memo(
  ({ title, buyersWithComments, buyersWithoutComments, testData, onProductClick }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {buyersWithComments.map((comment, index) => (
            <CommentItem
              key={getStableKey(comment, 'with', index)}
              comment={comment}
              field="improve_suggestions"
              testData={testData}
              onProductClick={onProductClick}
              index={index}
              showQuestions={true}
            />
          ))}
          {buyersWithoutComments.map((comment, index) => (
            <CommentItem
              key={getStableKey(comment, 'without', index)}
              comment={comment}
              field="choose_reason"
              testData={testData}
              onProductClick={onProductClick}
              index={buyersWithComments.length + index}
              showQuestions={false}
            />
          ))}
        </div>
      </div>
    );
  }
);

MergedBuyersSection.displayName = 'MergedBuyersSection';

const ShopperComments: React.FC<ShopperCommentsProps> = ({
  comparision,
  surveys,
  testName = 'Test',
  testData,
}) => {
  const { insight } = useInsightStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const handleCloseProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const availableVariants = useMemo(() => {
    return Object.entries(comparision)
      .filter(([_, comments]) => comments && comments.length > 0)
      .map(([variant]) => variant as 'a' | 'b' | 'c')
      .sort();
  }, [comparision]);

  const [variant, setVariant] = useState<'a' | 'b' | 'c' | 'summary'>('summary');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayVariant, setDisplayVariant] = useState<'a' | 'b' | 'c' | 'summary'>('summary');
  const prevVariantRef = useRef<'a' | 'b' | 'c' | 'summary'>('summary');

  useEffect(() => {
    if (prevVariantRef.current !== variant) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayVariant(variant);
        setIsTransitioning(false);
      }, 150);

      prevVariantRef.current = variant;

      return () => clearTimeout(timer);
    } else {
      setDisplayVariant(variant);
    }
  }, [variant]);

  const { currentComparision, currentSurveys, hasComparision, hasSurveys, testProductBuyers, competitorBuyers, hasTestProductBuyers, hasCompetitorBuyers, allTestProductBuyers, hasAllTestProductBuyers } = useMemo(() => {
    const currentComp = displayVariant === 'summary' ? [] : comparision[displayVariant];
    const currentSurv = displayVariant === 'summary' ? [] : surveys[displayVariant];
    const hasComp = displayVariant !== 'summary' && currentComp?.length > 0;
    const hasSurv = displayVariant !== 'summary' && currentSurv?.length > 0;

    // Separate test product buyers (synthetic entries without comments) from competitor buyers (with comments)
    // Use the explicit isTestProductBuyer flag to identify test-product buyers
    // Competitors are identified by having competitor_id (works for both Amazon and Walmart)
    const testBuyers = (currentComp || []).filter((c: any) => c.isTestProductBuyer === true);
    const compBuyers = (currentComp || []).filter((c: any) => 
      !c.isTestProductBuyer && !!c.competitor_id
    );

    // Merge surveys (buyers with comments) and testBuyers (buyers without comments)
    // Put buyers with comments first, then buyers without comments
    const mergedTestProductBuyers = [...currentSurv, ...testBuyers];
    const hasAnyTestProductBuyers = mergedTestProductBuyers.length > 0;

    return {
      currentComparision: currentComp,
      currentSurveys: currentSurv,
      hasComparision: hasComp,
      hasSurveys: hasSurv,
      testProductBuyers: testBuyers,
      competitorBuyers: compBuyers,
      hasTestProductBuyers: testBuyers.length > 0,
      hasCompetitorBuyers: compBuyers.length > 0,
      allTestProductBuyers: mergedTestProductBuyers,
      hasAllTestProductBuyers: hasAnyTestProductBuyers,
    };
  }, [displayVariant, comparision, surveys]);

  if (displayVariant !== 'summary' && !hasComparision && !hasSurveys) {
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
                                  displayVariant === v
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-green-200 text-black hover:bg-gray-400'
                                }`}
            >
              Variant {v.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-center">
          No comments available for variant {displayVariant.toUpperCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Shopper comments</h2>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setVariant('summary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                'summary' === displayVariant
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
                  v === displayVariant
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

      <div
        className={`transition-opacity duration-50 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {displayVariant === 'summary' && insight?.comment_summary && (
          <MarkdownContent content={insight.comment_summary} />
        )}
        {displayVariant === 'summary' && !insight?.comment_summary && (
          <div className="text-gray-500 text-center py-8">
            No comment summary available for this test.
          </div>
        )}

        {hasAllTestProductBuyers && (
        <div className="mb-8">
          <MergedBuyersSection
            title={`Your chosen product buyers (${allTestProductBuyers.length})`}
            buyersWithComments={currentSurveys}
            buyersWithoutComments={testProductBuyers}
            testData={testData}
            onProductClick={handleProductClick}
          />
        </div>
      )}

      {hasCompetitorBuyers && (
        <div>
          <CommentSection
            title={`Suggested improvements from competitive buyers (${competitorBuyers.length})`}
            comments={competitorBuyers}
            field="choose_reason"
            testData={testData}
            onProductClick={handleProductClick}
            sortByCompetitor={true}
          />
        </div>
        )}
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        product={selectedProduct}
      />
    </div>
  );
};

const ProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-64 h-64 object-cover rounded-lg"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
              <p className="text-2xl font-bold text-green-600 mb-4">
                {product.price ? `$${product.price.toFixed(2)}` : 'Price not available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopperComments;

