import React from 'react';
import { motion } from 'framer-motion';

interface Comment {
  text: string;
  author: {
    name: string;
    age: string;
  };
}

interface CommentsProps {
  type: 'positive' | 'negative';
  percentage: number;
  comments: Comment[];
}

export default function Comments({ type, percentage, comments }: CommentsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {type === 'positive' ? 'Positive' : 'Negative'} Comments
          <span className={`ml-2 text-sm px-2 py-1 rounded ${
            type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {percentage}%
          </span>
        </h3>
        <button className="text-primary-400 hover:text-primary-500 text-sm">
          Read More
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {comments.map((comment, index) => (
          <div key={index} className="bg-white rounded-xl p-4">
            <p className="text-gray-800 mb-4">{comment.text}</p>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                {comment.author.name[0]}
              </div>
              <div>
                <div className="font-medium">{comment.author.name}</div>
                <div className="text-sm text-gray-500">{comment.author.age}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}