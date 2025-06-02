import { Star } from 'lucide-react';

export const ProductCard: React.FC<{ title: string; item: any }> = ({ title, item }) => (
  <div key={item.id} className="relative flex flex-col justify-between p-1 rounded">
    <div key={item.id} className="relative pt-[100%] mb-3">
      <img
        src={item.image_url || item.image}
        alt={title || item.name}
        className="absolute top-0 left-0 w-full h-full object-contain "
      />
    </div>
    <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2 min-h-[38px]">
      {item.title || item.name}
    </h3>

    <div className="flex items-center mb-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const isFullStar = i < Math.floor(item.rating || 5);
          const isHalfStar = !isFullStar && i < item.rating;
          return (
            <Star
              key={i}
              className={`h-4 w-4 ${
                isFullStar
                  ? 'text-[#dd8433] fill-[#dd8433]'
                  : isHalfStar
                    ? 'text-[#dd8433] fill-current'
                    : 'text-gray-200 fill-gray-200'
              }`}
              style={{
                clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
              }}
            />
          );
        })}
      </div>
      <span className="ml-1 text-[12px] text-[#007185]">
        {item.reviews_count?.toLocaleString()}
      </span>
    </div>

    <div className="flex items-baseline gap-[2px] text-[#0F1111]">
      <span className="text-xs align-top mt-[1px]">US$</span>
      <span className="text-[21px] font-medium">{Math.floor(item.price)}</span>
      <span className="text-[13px]">{(item.price % 1).toFixed(2).substring(1)}</span>
    </div>
  </div>
);
