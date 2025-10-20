import { useProductReviews } from '../hooks/useProductReviews';
import { Review } from '../types/reviews';

interface ProductReviewsProps {
  asin: string;
}

export function ProductReviews({ asin }: ProductReviewsProps) {
  const { reviews, isLoading, error } = useProductReviews(asin);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!reviews || !reviews.reviews.length) {
    return (
      <div className="bg-[#F3F3F3] p-6 rounded-lg">
        <div className="flex items-center justify-center flex-col text-center">
          <p className="text-[#565959] text-[14px] mb-2">
            No reviews available for this product
          </p>
          <p className="text-[#565959] text-[12px]">
            Reviews will appear here when customers leave feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-2">{reviews.product_name}</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-yellow-500">
              {reviews.average_rating.toFixed(1)}
            </span>
            <span className="text-gray-600 ml-2">out of 5</span>
          </div>
          <span className="text-gray-500">
            ({reviews.total_reviews.toLocaleString()} reviews)
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Rating Breakdown</h3>
          {Object.entries(reviews.rating_breakdown)
            .reverse()
            .map(([key, value]) => {
              const stars = key.replace('_star', '');
              const starNum = stars === 'five' ? 5 : stars === 'four' ? 4 : stars === 'three' ? 3 : stars === 'two' ? 2 : 1;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{starNum} star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-yellow-500 h-4 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{value}%</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Customer Reviews</h3>
        {reviews.reviews.map((review, index) => (
          <ReviewCard key={`${review.username}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{review.username}</span>
            {review.verified_purchase && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < review.stars ? 'text-yellow-500' : 'text-gray-300'}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      <p className="text-gray-700 mb-3">{review.review}</p>

      {review.total_found_helpful !== undefined && review.total_found_helpful > 0 && (
        <div className="text-sm text-gray-600">
          {review.total_found_helpful} {review.total_found_helpful === 1 ? 'person' : 'people'}{' '}
          found this helpful
        </div>
      )}

      {review.manufacturer_replied && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Manufacturer replied to this review
          </span>
        </div>
      )}
    </div>
  );
}
