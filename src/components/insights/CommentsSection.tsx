import React from 'react';
import { motion } from 'framer-motion';

export default function CommentsSection() {
  const positiveComments = [
    {
      text: "Eucalyptus Glow sounds refreshing and unique—I can imagine it being clean and calming, like something I'd use for my bedding.",
      author: { name: 'Mary', age: '18-24' }
    },
    {
      text: "I'd probably choose Eucalyptus Glow over the others because the name makes me think of a natural, fresh scent that's not too strong",
      author: { name: 'Frank', age: '25-34' }
    },
    {
      text: "The name Eucalyptus Glow caught my attention right away - it feels premium and soothing, like a scent I'd want for my favorite clothes",
      author: { name: 'Oliver', age: '55+' }
    }
  ];

  const negativeComments = [
    {
      text: "Eucalyptus Glow didn't really stand out to me—it sounds too niche, and I'm not sure I'd want my laundry to smell like eucalyptus",
      author: { name: 'Rose', age: '18-24' }
    },
    {
      text: "The name Eucalyptus Glow makes me think of a spa, not something I'd want on my clothes every day. It feels a bit too specialized for my taste",
      author: { name: 'Martin', age: '55+' }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Positive Comments */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Positive Comments
            <span className="ml-2 text-sm px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
              87%
            </span>
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {positiveComments.map((comment, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 mb-4">{comment.text}</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center text-[#00A67E] font-medium">
                  {comment.author.name[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{comment.author.name}</div>
                  <div className="text-sm text-gray-500">{comment.author.age}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Negative Comments */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Negative Comments
            <span className="ml-2 text-sm px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
              13%
            </span>
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {negativeComments.map((comment, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 mb-4">{comment.text}</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-800 font-medium">
                  {comment.author.name[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{comment.author.name}</div>
                  <div className="text-sm text-gray-500">{comment.author.age}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}