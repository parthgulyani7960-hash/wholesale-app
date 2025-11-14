

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

const WishlistView: React.FC = () => {
    const { wishlistItems, setView } = useAppContext();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-center mb-10 text-primary">Your Wishlist</h1>
            {wishlistItems.length === 0 ? (
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-6">Your wishlist is empty.</p>
                     <button
                        onClick={() => setView('products')}
                        className="bg-accent text-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
                    >
                        Find Products You'll Love
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlistItems.map(product => (
                        <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                    ))}
                </div>
            )}
            <ProductQuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default WishlistView;
