import React, { useRef } from 'react';
import { Search, Heart, Star, ChevronLeft, ChevronRight, User, ShoppingCart, Menu, MapPin, Sparkles, Building, Briefcase, Tag, Truck, Repeat } from 'lucide-react';

// Types for product data
interface Product {
  id: string | number;
  name: string;
  price: number;
  size?: string;
  imageUrl: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
  availability?: string;
  shipping?: string;
}

interface WalmartSkinProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

// Mock Data for Products (fallback when no products provided)
const defaultTopPicks: Product[] = [
  {
    id: 1,
    name: 'Marketside Salmão do Atlântico em Filé',
    price: 8.61,
    size: '0.70 - 1.25 lb',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Salmão',
    rating: 4.5,
    reviews: 150,
  },
  {
    id: 2,
    name: 'bettergoods Batatas Assadas e Temperadas',
    price: 3.64,
    size: '12 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Batatas',
    rating: 4.2,
    reviews: 231,
  },
  {
    id: 3,
    name: 'Marketside Lanças de Aspargos Frescos',
    price: 3.84,
    size: '10 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Aspargos',
    rating: 4.8,
    reviews: 412,
  },
  {
    id: 4,
    name: 'Birds Eye Cenouras Assadas Congeladas',
    price: 3.97,
    size: '12 oz, Saco',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Cenouras',
    rating: 4.0,
    reviews: 189,
  },
  {
    id: 5,
    name: 'bettergoods Batatas Assadas e Temperadas',
    price: 3.64,
    size: '12 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Batatas',
    rating: 4.3,
    reviews: 305,
  },
  {
    id: 6,
    name: 'Batatinhas Frescas Medley',
    price: 3.96,
    size: '1.5 lb Saco',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Batatinhas',
    rating: 4.6,
    reviews: 521,
  },
];

const defaultMealBuilders: Product[] = [
  {
    id: 7,
    name: 'Idahoan Manteiga & Ervas Purê de Batatas',
    price: 1.38,
    size: '4 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Purê',
    rating: 4.7,
    reviews: 890,
  },
  {
    id: 8,
    name: 'Knorr Lados de Arroz Cheddar Brócolis',
    price: 1.32,
    size: '5.7 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Arroz',
    rating: 4.5,
    reviews: 643,
  },
  {
    id: 9,
    name: 'Knorr Lados de Arroz Sabor Frango',
    price: 1.32,
    size: '5.6 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Arroz+Frango',
    rating: 4.6,
    reviews: 1024,
  },
  {
    id: 10,
    name: 'Arroz Jasmim de Grão Longo Enriquecido',
    price: 2.48,
    size: '32 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Arroz+Jasmim',
    rating: 4.8,
    reviews: 1530,
  },
  {
    id: 11,
    name: 'Hamburger Helper Cheeseburger Macaroni',
    price: 1.98,
    size: '6.6 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Macarrão',
    rating: 4.4,
    reviews: 789,
  },
  {
    id: 12,
    name: 'Kraft Macarrão com Queijo Original',
    price: 1.24,
    size: '7.25 oz',
    imageUrl: 'https://placehold.co/200x200/F7F7F7/333?text=Mac+&+Queijo',
    rating: 4.9,
    reviews: 2345,
  },
];

// Main Header Component
const MainHeader = ({ searchQuery, onSearch }: { searchQuery?: string; onSearch?: (query: string) => void }) => (
  <header className="bg-[#0071dc] text-white p-2 md:p-3">
    <div className="container mx-auto flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button className="md:hidden"><Menu size={28} /></button>
        <img src="https://i.imgur.com/w3I6wI5.png" alt="Walmart Logo" className="h-8 md:h-9" />
      </div>
      <div className="hidden md:flex items-center gap-2 bg-[#005cb4] p-2 rounded-full cursor-pointer">
        <MapPin size={20} />
        <div>
          <p className="text-xs font-bold">Retirada ou entrega?</p>
          <p className="text-xs">Sacramento, 95829 • Sacramento Supe...</p>
        </div>
      </div>
      <div className="flex-grow mx-2 md:mx-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Pesquise tudo no Walmart online e na loja" 
            value={searchQuery || ''}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full p-2 pl-4 pr-12 rounded-full text-black text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" 
          />
          <button className="absolute right-0 top-0 h-full px-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <Search size={20} className="text-black" />
          </button>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <div className="text-center text-xs cursor-pointer">
          <Repeat size={24} className="mx-auto" />
          <p>Reordenar</p>
        </div>
        <div className="text-center text-xs cursor-pointer">
          <Heart size={24} className="mx-auto" />
          <p>Meus Itens</p>
        </div>
        <div className="text-center text-xs cursor-pointer">
          <User size={24} className="mx-auto" />
          <p>Entrar</p>
        </div>
      </div>
      <div className="flex flex-col items-center cursor-pointer">
        <ShoppingCart size={28} />
        <span className="text-xs font-bold">$0.00</span>
      </div>
    </div>
  </header>
);

// Secondary Navigation Component
const SecondaryNav = () => {
  const navItems = [
    { icon: <Menu size={20}/>, label: 'Departamentos', dropdown: true },
    { icon: <Building size={20}/>, label: 'Serviços', dropdown: true },
    { icon: <Sparkles size={20}/>, label: 'Novidades', dropdown: false },
    { icon: <Tag size={20}/>, label: 'Volta às Aulas', dropdown: false },
    { icon: <Briefcase size={20}/>, label: 'Escritório & Casa', dropdown: false },
    { icon: <Truck size={20}/>, label: 'Entrega de Farmácia', dropdown: false },
  ];
  
  return (
    <nav className="bg-white shadow-sm p-2 hidden md:block">
      <div className="container mx-auto flex items-center justify-start gap-4 overflow-x-auto scrollbar-hide">
        {navItems.map((item, index) => (
          <a href="#" key={index} className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
            {item.icon}<span>{item.label}</span>
            {item.dropdown && <ChevronRight size={16} className="transform -rotate-90"/>}
          </a>
        ))}
      </div>
    </nav>
  );
};

// Product Card Component
const ProductCard = ({ product, onProductClick, onAddToCart }: { 
  product: Product; 
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 w-48 flex-shrink-0 flex flex-col relative">
    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10">
      <Heart size={24} />
    </button>
    
    <div 
      className="h-32 mb-2 flex items-center justify-center cursor-pointer"
      onClick={() => onProductClick?.(product)}
    >
      <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
    </div>
    
    <div className="flex-grow flex flex-col">
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
        )}
      </div>
      
      <p 
        className="text-sm text-gray-700 h-10 overflow-hidden mt-1 cursor-pointer hover:text-[#0071dc]"
        onClick={() => onProductClick?.(product)}
      >
        {product.name}
      </p>
      
      {product.size && (
        <p className="text-xs text-gray-500 mt-1">{product.size}</p>
      )}
      
      {product.rating && (
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < Math.round(product.rating!) ? 'text-black fill-current' : 'text-gray-300'} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews || 0})</span>
        </div>
      )}
      
      {product.availability && (
        <p className="text-xs text-green-600 mt-1">{product.availability}</p>
      )}
      
      {product.shipping && (
        <p className="text-xs text-gray-500 mt-1">{product.shipping}</p>
      )}
      
      <div className="mt-auto pt-2">
        <button 
          className="bg-[#0071dc] text-white font-bold py-1 px-3 rounded-full hover:bg-[#005cb4] transition-colors flex items-center justify-center gap-1 text-sm w-full"
          onClick={() => onAddToCart?.(product)}
        >
          <span className="text-lg font-light">+</span> Adicionar
        </button>
      </div>
    </div>
  </div>
);

// Product Grid Component (Carousel)
const ProductGrid = ({ 
  title, 
  products, 
  onProductClick, 
  onAddToCart 
}: { 
  title: string; 
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <a href="#" className="text-sm font-bold text-[#0071dc] hover:underline hidden md:block">
            Compre agora
          </a>
        </div>
        
        <div className="relative">
          <div 
            ref={scrollRef} 
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" 
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map(product => (
              <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
                <ProductCard 
                  product={product} 
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => scroll('left')} 
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 opacity-75 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => scroll('right')} 
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 opacity-75 hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

// Main Walmart Skin Component
export default function WalmartSkin({ 
  products = [], 
  isLoading = false, 
  onProductClick, 
  onAddToCart, 
  onSearch, 
  searchQuery 
}: WalmartSkinProps) {
  // Use provided products or fallback to default data
  const displayProducts = products.length > 0 ? products : [...defaultTopPicks, ...defaultMealBuilders];
  
  // Split products into sections if we have enough
  const topPicks = displayProducts.slice(0, Math.ceil(displayProducts.length / 2));
  const mealBuilders = displayProducts.slice(Math.ceil(displayProducts.length / 2));

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <MainHeader searchQuery={searchQuery} onSearch={onSearch} />
        <SecondaryNav />
        <main className="px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071dc] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div className="bg-gray-50 min-h-screen font-sans">
        <MainHeader searchQuery={searchQuery} onSearch={onSearch} />
        <SecondaryNav />
        
        <main className="px-4">
          {displayProducts.length > 0 ? (
            <>
              <ProductGrid 
                title="Escolhas da semana" 
                products={topPicks}
                onProductClick={onProductClick}
                onAddToCart={onAddToCart}
              />
              <ProductGrid 
                title="Refeições fáceis para a despensa" 
                products={mealBuilders}
                onProductClick={onProductClick}
                onAddToCart={onAddToCart}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
