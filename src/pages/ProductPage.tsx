import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, Star, ChevronLeft, ChevronRight, User, ShoppingCart, Menu, MapPin, Sparkles, Building, Briefcase, Tag, Truck, Repeat, Upload, MoreHorizontal, Info, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

// Mock Data for Products
const mockProducts = [
  { id: 1, name: 'Marketside Salmão do Atlântico em Filé', price: 8.61, size: '0.70 - 1.25 lb', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Salmão', rating: 4.5, reviews: 150, category: 'topPicks', description: 'Salmão do Atlântico fresco e de alta qualidade, perfeito para grelhar ou assar.', details: ['Pronto para cozinhar', 'Excelente fonte de Ômega-3', 'Criado de forma sustentável'], ingredients: 'Salmão do Atlântico (Peixe), Cor pode ser adicionada através da ração.' },
  { id: 2, name: 'bettergoods Batatas Assadas e Temperadas', price: 3.64, size: '12 oz', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Batatas', rating: 4.2, reviews: 231, category: 'topPicks', description: 'Batatas deliciosamente temperadas e prontas para assar para um acompanhamento fácil.', details: ['Pré-temperado', 'Rápido e fácil de preparar', 'Feito com ervas e especiarias reais'], ingredients: 'Batatas, Azeite, Sal, Pimenta Preta, Alho em Pó, Alecrim.' },
  { id: 3, name: 'Marketside Lanças de Aspargos Frescos', price: 3.84, size: '10 oz', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Aspargos', rating: 4.8, reviews: 412, category: 'topPicks', description: 'Aspargos frescos e crocantes, ideais para cozinhar no vapor, grelhar ou assar.', details: ['Fresco e crocante', 'Excelente fonte de vitaminas A e C', 'Versátil para muitas receitas'], ingredients: 'Aspargos.' },
  { id: 4, name: 'Birds Eye Cenouras Assadas Congeladas', price: 3.97, size: '12 oz, Saco', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Cenouras', rating: 4.0, reviews: 189, category: 'topPicks', description: 'Cenouras doces e macias, assadas na perfeição e congeladas para sua conveniência.', details: ['Congelado na hora para manter o frescor', 'Sem conservantes artificiais', 'Pronto em minutos'], ingredients: 'Cenouras, Sal Marinho.' },
  { id: 5, name: 'bettergoods Batatas Assadas e Temperadas', price: 3.64, size: '12 oz', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Batatas', rating: 4.3, reviews: 305, category: 'topPicks', description: 'Batatas deliciosamente temperadas e prontas para assar para um acompanhamento fácil.', details: ['Pré-temperado', 'Rápido e fácil de preparar', 'Feito com ervas e especiarias reais'], ingredients: 'Batatas, Azeite, Sal, Pimenta Preta, Alho em Pó, Alecrim.' },
  { id: 6, name: 'Batatinhas Frescas Medley', price: 3.96, size: '1.5 lb Saco', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Batatinhas', rating: 4.6, reviews: 521, category: 'topPicks', description: 'Uma mistura de batatas coloridas, perfeitas para assar ou ferver.', details: ['Mistura colorida de variedades', 'Pele fina, sem necessidade de descascar', 'Ótimo para acompanhamentos e saladas'], ingredients: 'Batatas Vermelhas, Batatas Roxas, Batatas Amarelas.' },
  { id: 7, name: 'Idahoan Manteiga & Ervas Purê de Batatas', price: 1.38, size: '4 oz', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Purê', rating: 4.7, reviews: 890, category: 'mealBuilders', description: 'Purê de batatas cremoso e saboroso que fica pronto em minutos.', details: ['Feito com batatas 100% reais de Idaho', 'Sabor natural de manteiga e ervas', 'Sem glúten'], ingredients: 'Flocos de Batata de Idaho, Óleo Vegetal, Sal, Soro de Leite, Açúcar, Manteiga em Pó, Ervas.' },
  { id: 8, name: 'Knorr Lados de Arroz Cheddar Brócolis', price: 1.32, size: '5.7 oz', imageUrl: 'https://placehold.co/400x400/F7F7F7/333?text=Arroz', rating: 4.5, reviews: 643, category: 'mealBuilders', description: 'Uma mistura cremosa de arroz e massa em um molho de queijo cheddar com brócolis.', details: ['Pronto em 7 minutos', 'Sem sabores artificiais', 'Acompanhamento perfeito para frango'], ingredients: 'Arroz Parboilizado de Grão Longo, Macarrão, Sólidos de Queijo Cheddar, Brócolis Desidratado.' },
];

const topPicks = mockProducts.filter(p => p.category === 'topPicks');
const mealBuilders = mockProducts.filter(p => p.category === 'mealBuilders');

// Componente para o cabeçalho principal
const MainHeader = () => (
    <header className="bg-[#0071dc] text-white p-2 md:p-3 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <button className="md:hidden">
                    <Menu size={28} />
                </button>
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

// Componente para a barra de navegação secundária
const SecondaryNav = () => {
    const navItems = [
        { icon: <Menu size={20}/>, label: 'Departamentos', dropdown: true }, 
        { icon: <Building size={20}/>, label: 'Serviços', dropdown: true }, 
        { icon: <Sparkles size={20}/>, label: 'Novidades', dropdown: false }, 
        { icon: <Tag size={20}/>, label: 'Volta às Aulas', dropdown: false }, 
        { icon: <Briefcase size={20}/>, label: 'Escritório & Casa', dropdown: false }, 
        { icon: <Truck size={20}/>, label: 'Entrega de Farmácia', dropdown: false }
    ];
    
    return (
        <nav className="bg-white shadow-sm p-2 hidden md:block">
            <div className="container mx-auto flex items-center justify-start gap-4 overflow-x-auto scrollbar-hide">
                {navItems.map((item, index) => (
                    <a href="#" key={index} className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
                        {item.icon}
                        <span>{item.label}</span>
                        {item.dropdown && <ChevronRight size={16} className="transform -rotate-90"/>}
                    </a>
                ))}
            </div>
        </nav>
    );
};

// Componente para o cartão de produto
const ProductCard = ({ product, onProductClick }) => (
    <div 
        onClick={() => onProductClick(product)} 
        className="bg-white border border-gray-200 rounded-lg p-4 w-48 flex-shrink-0 flex flex-col cursor-pointer hover:shadow-lg transition-shadow relative"
    >
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10">
            <Heart size={24} />
        </button>
        <div className="h-32 mb-2 flex items-center justify-center">
            <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
        <div className="flex-grow flex flex-col">
            <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-700 h-10 overflow-hidden mt-1">{product.name}</p>
            <p className="text-xs text-gray-500 mt-1">{product.size}</p>
            <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.round(product.rating) ? 'text-black fill-current' : 'text-gray-300'} 
                    />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
            </div>
            <div className="mt-auto pt-2">
                <button className="bg-[#0071dc] text-white font-bold py-1 px-3 rounded-full hover:bg-[#005cb4] transition-colors flex items-center justify-center gap-1 text-sm">
                    <span className="text-lg font-light">+</span> Adicionar
                </button>
            </div>
        </div>
    </div>
);

// Componente para a grade de produtos (Carrossel)
const ProductGrid = ({ title, products, onProductClick }) => {
    const scrollRef = useRef(null);
    
    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.offsetWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
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
                                <ProductCard product={product} onProductClick={onProductClick} />
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

// Página de Listagem de Produtos
const ProductListingPage = ({ onProductClick }) => (
    <main className="px-4">
        <ProductGrid title="Escolhas da semana" products={topPicks} onProductClick={onProductClick} />
        <ProductGrid title="Refeições fáceis para a despensa" products={mealBuilders} onProductClick={onProductClick} />
    </main>
);

// Página de Detalhes do Produto
const ProductDetailPage = ({ product, onBack }) => {
    const [mainImage, setMainImage] = useState(product.imageUrl || product.image_url || product.image);
    const thumbnails = [
        product.imageUrl || product.image_url || product.image, 
        'https://placehold.co/100x100/EFEFEF/333?text=Vista+2', 
        'https://placehold.co/100x100/EFEFEF/333?text=Vista+3', 
        'https://placehold.co/100x100/EFEFEF/333?text=Nutrição'
    ];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0071dc] mb-4"
            >
                <ArrowLeft size={16} /> 
                {location.state?.fromTest ? 'Voltar para o teste' : 'Voltar para os resultados'}
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna da Imagem */}
                <div className="lg:col-span-1 flex flex-col md:flex-row gap-4">
                    <div className="flex md:flex-col gap-2 order-2 md:order-1">
                        {thumbnails.map((thumb, index) => (
                            <div 
                                key={index} 
                                className="w-16 h-16 border rounded-md p-1 cursor-pointer hover:border-[#0071dc]" 
                                onClick={() => setMainImage(thumb)}
                            >
                                <img src={thumb} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain" />
                            </div>
                        ))}
                    </div>
                    <div className="flex-grow order-1 md:order-2">
                        <img 
                            src={mainImage} 
                            alt={product.title || product.name || 'Product'} 
                            className="w-full rounded-lg border" 
                        />
                    </div>
                </div>

                {/* Coluna de Informações */}
                <div className="lg:col-span-1">
                    <span className="text-xs font-bold bg-blue-100 text-[#0071dc] px-2 py-1 rounded-full">
                        Escolha popular
                    </span>
                    <h1 className="text-2xl font-bold mt-2">{product.title || product.name || 'Product Name'}</h1>
                    {product.rating && (
                        <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={16} 
                                    className={i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                                />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">{product.rating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500 ml-1">({product.reviews || 0} avaliações)</span>
                        </div>
                    )}
                    <div className="mt-4">
                        <p className="text-gray-700">{product.description || 'No description available'}</p>
                    </div>
                    <div className="mt-6">
                        <h2 className="font-bold text-lg mb-2">Sobre este item</h2>
                        {product.details && product.details.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {product.details.map((detail, i) => (
                                    <li key={i}>{detail}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No additional details available</p>
                        )}
                    </div>
                </div>

                {/* Coluna de Compra */}
                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">
                                {Number.isFinite(product?.price) ? `$${product.price.toFixed(2)}` : 'N/A'}
                            </span>
                            <span className="text-gray-500 text-sm">/cada</span>
                        </div>
                        <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle size={16}/> Frete grátis com 30 dias de teste
                        </p>
                        <button className="w-full bg-[#0071dc] text-white font-bold py-3 rounded-full mt-4 hover:bg-[#005cb4]">
                            Adicionar ao carrinho
                        </button>
                        <div className="mt-4 space-y-3">
                            <div className="border rounded-md p-3 flex justify-between items-center">
                                <label htmlFor="subscribe" className="flex flex-col">
                                    <span className="font-bold">Assinar</span>
                                    <span className="text-sm text-green-600">Economize e receba hoje</span>
                                </label>
                                <input type="radio" name="purchaseType" id="subscribe" />
                            </div>
                            <div className="border-2 border-[#0071dc] rounded-md p-3 flex justify-between items-center bg-blue-50">
                                <label htmlFor="onetime" className="font-bold">Compra única</label>
                                <input type="radio" name="purchaseType" id="onetime" defaultChecked />
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="font-bold mb-2">Como você receberá:</h3>
                            <div className="flex justify-around text-center">
                                <div className="p-2 border-b-4 border-[#0071dc]">
                                    <Truck size={24} className="mx-auto text-[#0071dc]" />
                                    <p className="text-sm font-bold text-[#0071dc]">Envio</p>
                                    <p className="text-xs">A partir de amanhã</p>
                                </div>
                                <div className="p-2">
                                    <MapPin size={24} className="mx-auto" />
                                    <p className="text-sm font-bold">Retirada</p>
                                    <p className="text-xs">Não disponível</p>
                                </div>
                                <div className="p-2">
                                    <Building size={24} className="mx-auto" />
                                    <p className="text-sm font-bold">Entrega</p>
                                    <p className="text-xs">A partir de 19h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente principal da aplicação
export default function ProductPage() {
    const [currentPage, setCurrentPage] = useState('listing'); // 'listing' ou 'detail'
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Check if we're coming from a test with a selected product
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (location.state?.selectedProduct) {
            setSelectedProduct(location.state.selectedProduct);
            setCurrentPage('detail');
        }
    }, [location.state]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setCurrentPage('detail');
        window.scrollTo(0, 0);
    };

      const handleBackToListing = () => {
    // If we came from a test, go back to the test
    if (location.state?.fromTest) {
      navigate(-1); // Go back to previous page (the test)
      return;
    }
    
    // Otherwise, go back to listing
    setSelectedProduct(null);
    setCurrentPage('listing');
  };

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
            <div className="bg-white min-h-screen font-sans">
                <MainHeader />
                <SecondaryNav />
                {currentPage === 'listing' && (
                    <ProductListingPage onProductClick={handleProductClick} />
                )}
                {currentPage === 'detail' && selectedProduct && (
                    <ProductDetailPage product={selectedProduct} onBack={handleBackToListing} />
                )}
            </div>
        </>
    );
}
