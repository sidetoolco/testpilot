import { Question } from '../../../components/test-setup/QuestionSelection';

export const AVAILABLE_QUESTIONS: Question[] = [
  // Existing questions (all required/recommended)
  {
    id: 'value',
    title: 'Value Rating',
    description: 'How would you rate the value of this product?',
    category: 'rating',
    field: 'value',
    required: true,
  },
  {
    id: 'appearance',
    title: 'Appearance Rating',
    description: 'How appealing do you find the design and appearance of this product?',
    category: 'rating',
    field: 'appearance',
    required: true,
  },
  {
    id: 'confidence',
    title: 'Confidence Rating',
    description: 'How confident are you that this product will deliver its promised results?',
    category: 'rating',
    field: 'confidence',
    required: true,
  },
  {
    id: 'brand',
    title: 'Brand Trust Rating',
    description: 'How much do you trust this brand to meet your expectations?',
    category: 'rating',
    field: 'brand',
    required: true,
  },
  {
    id: 'convenience',
    title: 'Convenience Rating',
    description: 'How convenient does this product seem to use?',
    category: 'rating',
    field: 'convenience',
    required: true,
  },
  // New questions
  {
    id: 'flavor',
    title: 'Flavor Rating',
    description: 'How would you rate the flavor/taste of this product?',
    category: 'rating',
    field: 'flavor',
  },
  {
    id: 'quantity',
    title: 'Quantity Rating',
    description: 'How satisfied are you with the quantity/amount provided?',
    category: 'rating',
    field: 'quantity',
  },
  {
    id: 'packaging',
    title: 'Packaging Rating',
    description: 'How would you rate the packaging design and functionality?',
    category: 'rating',
    field: 'packaging',
  },
  {
    id: 'freshness',
    title: 'Freshness Rating',
    description: 'How would you rate the perceived freshness/quality of this product?',
    category: 'rating',
    field: 'freshness',
  },
  {
    id: 'recommendation',
    title: 'Recommendation Rating',
    description: 'How likely would you be to recommend this product to others?',
    category: 'rating',
    field: 'recommendation',
  },
];

export const getQuestionById = (id: string): Question | undefined => {
  return AVAILABLE_QUESTIONS.find(q => q.id === id);
};

export const getQuestionsByIds = (ids: string[]): Question[] => {
  return ids.map(id => getQuestionById(id)).filter(Boolean) as Question[];
};

export const getDefaultQuestions = (): string[] => {
  return ['value', 'appearance', 'confidence', 'brand', 'convenience'];
};

export const getQuestionText = (questionId: string, isComparison: boolean = false): string => {
  const question = getQuestionById(questionId);
  if (!question) return '';

  const baseText = question.description;
  
  if (isComparison) {
    // For comparison view, modify the text to be comparative
    return baseText.replace('this product', 'Item A compared to Item B');
  }
  
  return baseText;
}; 