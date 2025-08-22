import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Star, User, ShoppingCart, Menu, MapPin, Sparkles, Building, Briefcase, Tag, Truck, Repeat, ArrowLeft, CheckCircle } from 'lucide-react';



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
                
                    </a>
                ))}
            </div>
        </nav>
    );
};





// Página de Detalhes do Produto
const ProductDetailPage = ({ product, onBack, fromTest }: { product: any; onBack: () => void; fromTest?: boolean }) => {
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
                {fromTest ? 'Back to test' : 'Back to results'}
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
                                {product.details.map((detail: string, i: number) => (
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Check if we're coming from a test with a selected product
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (location.state?.selectedProduct) {
            setSelectedProduct(location.state.selectedProduct);
        }
    }, [location.state]);

    const handleBackToListing = () => {
        // If we came from a test, go back to the test
        if (location.state?.fromTest) {
            navigate(-1); // Go back to previous page (the test)
            return;
        }
        
        // Otherwise, go back to listing
        setSelectedProduct(null);
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
                {selectedProduct && (
                    <ProductDetailPage 
                        product={selectedProduct} 
                        onBack={handleBackToListing} 
                        fromTest={Boolean(location.state?.fromTest)}
                    />
                )}
            </div>
        </>
    );
}
