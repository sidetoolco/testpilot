import React from 'react';
import { useStore } from '../store/useStore';

export function CategorySelector() {
  const { categories, selectedCategory, setSelectedCategory, fetchCompetitors } = useStore();

  const handleCategorySelect = async (category: typeof categories[0]) => {
    setSelectedCategory(category);
    await fetchCompetitors(category.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategorySelect(category)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedCategory?.id === category.id
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-200 hover:border-primary-200'
          }`}
        >
          <div className="aspect-video rounded-md overflow-hidden mb-3">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500">
            {category.competitorCount} top competitors
          </p>
        </button>
      ))}
    </div>
  );
}