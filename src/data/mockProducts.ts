import { Product } from '../types';

// Real Amazon product images
const productImages = [
  'https://m.media-amazon.com/images/I/51qaKNe75AL.AC_SR160,134_QL70.jpg',
  'https://m.media-amazon.com/images/I/51J5LJIHa9L.AC_SR160,134_QL70.jpg',
  'https://m.media-amazon.com/images/I/51aeqWSqDrL.AC_SR160,134_QL70.jpg',
  'https://m.media-amazon.com/images/I/61h8UHRjauL.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/41z917f644L.AC_SR250,250_QL65.jpg',
  'https://m.media-amazon.com/images/I/41Vxbu2SNEL.AC_SR250,250_QL65.jpg',
  'https://m.media-amazon.com/images/I/411yF6W8tbL.AC_SR250,250_QL65.jpg',
  'https://m.media-amazon.com/images/I/61SSAhzy+xL.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/61zfsdWQLxL.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/71FxmK9qiHL.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/71VSaspFGhL.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/71x4L7+8zEL.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/81edBxfG+7L.AC_UL320.jpg',
  'https://m.media-amazon.com/images/I/71peBi4LONL.AC_UL320.jpg'
];

// Generate 40 products with real images
export const mockProducts: Product[] = Array.from({ length: 40 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `${i < 20 ? 'Premium' : 'Standard'} Fabric Softener ${String.fromCharCode(65 + (i % 26))}`,
  description: 'High-quality fabric softener with advanced formula',
  price: 9.99 + (i % 10),
  images: [productImages[i % productImages.length]],
  image: productImages[i % productImages.length],
  category: 'Fabric Softener',
  brand: `Brand ${String.fromCharCode(65 + (i % 26))}`,
  rating: 4 + (Math.random() * 1),
  reviews: 1000 + Math.floor(Math.random() * 10000),
  isCompetitor: true,
  loads: 50 + (i * 10),
  bestSeller: i === 0,
  userId: 'demo',
  createdAt: new Date(),
  updatedAt: new Date()
}));