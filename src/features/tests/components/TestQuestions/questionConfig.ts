import { Question } from '../../../components/test-setup/QuestionSelection';

export const AVAILABLE_QUESTIONS: Question[] = [
  // Required questions (locked)
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
    id: 'brand',
    title: 'Brand Trust Rating',
    description: 'How much do you trust this brand to meet your expectations?',
    category: 'rating',
    field: 'brand',
    required: true,
  },
  // Optional questions
  {
    id: 'confidence',
    title: 'Confidence Rating',
    description: 'How confident are you that this product will deliver its promised results?',
    category: 'rating',
    field: 'confidence',
    required: false,
  },
  {
    id: 'convenience',
    title: 'Convenience Rating',
    description: 'How convenient does this product seem to use?',
    category: 'rating',
    field: 'convenience',
    required: false,
  },
  // New additional questions
  {
    id: 'appetizing',
    title: 'Appetizing Rating',
    description: 'This product looks / sounds appetizing?',
    category: 'rating',
    field: 'appetizing',
    required: false,
  },
  {
    id: 'target_audience',
    title: 'Target Audience Rating',
    description: 'This is a product for people like me?',
    category: 'rating',
    field: 'target_audience',
    required: false,
  },
  {
    id: 'novelty',
    title: 'Novelty Rating',
    description: 'This product is new and different?',
    category: 'rating',
    field: 'novelty',
    required: false,
  },
];

export const getQuestionById = (id: string): Question | undefined => {
  return AVAILABLE_QUESTIONS.find(q => q.id === id);
};

export const getQuestionsByIds = (ids: string[]): Question[] => {
  return ids.map(id => getQuestionById(id)).filter(Boolean) as Question[];
};

export const getDefaultQuestions = (): string[] => {
  return ['value', 'appearance', 'brand', 'confidence', 'convenience'];
};

export const getRequiredQuestions = (): string[] => {
  return ['value', 'appearance', 'brand'];
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