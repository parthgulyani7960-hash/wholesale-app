
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
    product: Product;
    onQuickView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const { viewProduct, updateProduct, setView, subscribeToOutOfStock, addToCart, addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
    const isWholesaler = currentUser?.role === 'wholesaler';
    
    const displayPrice = isWholesaler ? product.wholesalePrice : (product.discountPrice ?? product.price);
    const strikethroughPrice = !isWholesaler && product.discountPrice ? product.price : null;

    const discountPercentage = product.discountPercentage 
        ? product.discountPercentage
        : product.discountPrice
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : 0;

    const isWishlisted = isInWishlist(product.id);

    const isOutOfStock = product.stock === 0;
    const isLowStock = !isOutOfStock && product.stock <= (product.reorderPoint || 5);
    const isInStock = !isOutOfStock && !isLowStock;
    const isSubscribed = currentUser?.outOfStockSubscriptions?.includes(product.id);
    
    const ACTION_WIDTH = 160;
    
    const maxAllowedQuantity = Math.min(product.stock, product.maxOrderQuantity || Infinity);

    const touchStartX = useRef(0);
    const cardTranslateX = useRef(0);
    const [swipeX, setSwipeX] = useState(0);
    const isSwipedRef = useRef(false);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
        setSwipeX(0);
        cardTranslateX.current = 0;
        isSwipedRef.current = false;
    };
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product, quantity);
        setSwipeX(0);
        cardTranslateX.current = 0;
        isSwipedRef.current = false;
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuantity(q => Math.min(q + 1, maxAllowedQuantity));
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuantity(q => Math.max(q - 1, 1));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        e.currentTarget.classList.remove('transition-transform', 'duration-300', 'ease-out');
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentX = e.touches[0].clientX;
        let deltaX = currentX - touchStartX.current;
        const newTranslateX = cardTranslateX.current + deltaX;
        const clampedX = Math.max(-ACTION_WIDTH, Math.min(0, newTranslateX));
        setSwipeX(clampedX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.currentTarget.classList.add('transition-transform', 'duration-300', 'ease-out');
        const SWIPE_THRESHOLD = ACTION_WIDTH / 2;

        if (swipeX < -SWIPE_THRESHOLD) {
            setSwipeX(-ACTION_WIDTH);
            cardTranslateX.current = -ACTION_WIDTH;
            isSwipedRef.current = true;
        } else {
            setSwipeX(0);
            cardTranslateX.current = 0;
            isSwipedRef.current = false;
        }
    };

    const handleCardClick = () => {
        if (isSwipedRef.current) {
            setSwipeX(0);
            cardTranslateX.current = 0;
            isSwipedRef.current = false;
            return;
        }
        viewProduct(product.id);
    };
    
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
    };
    
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isAdmin) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const newImage = reader.result as string;
                let newImageUrls = [...product.imageUrls];
                if (newImageUrls.length > 0) {
                    newImageUrls[0] = newImage;
                } else {
                    newImageUrls = [newImage];
                }
                await updateProduct({ ...product, imageUrls: newImageUrls });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNotifyMe = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            setView('login');
        } else {
            subscribeToOutOfStock(product.id, currentUser);
        }
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onQuickView(product);
    };

    const tagColors: { [key: string]: string } = {
        'On Sale': 'bg-red-500',
        'New Arrival': 'bg-blue-500',
        'Best Seller': 'bg-yellow-500 text-black',
        'Organic': 'bg-green-500',
        'Local Favorite': 'bg-orange-500',
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:scale-[1.03] hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col relative">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
            {/* --- Quick Actions Container (Revealed on Swipe) --- */}
            <div className="absolute top-0 right-0 h-full w-40 flex flex-col z-0">
                <button
                    onClick={handleWishlistToggle}
                    className={`flex-1 flex flex-col items-center justify-center transition-colors duration-200 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                    <span className="text-xs font-semibold">{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
                <button
                    onClick={handleAddToCart}
                    className="flex-1 flex flex-col items-center justify-center bg-accent text-primary hover:bg-yellow-400 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label="Add to cart"
                    disabled={product.stock <= 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-semibold">{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
            </div>
            
            {/* --- Swipeable Content --- */}
            <div
                className="relative z-10 bg-white h-full"
                style={{ transform: `translateX(${swipeX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleCardClick}
            >
                <div className="relative group/carousel">
                     {isAdmin ? (
                        <div onClick={handleImageClick} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 cursor-pointer z-30">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="text-white text-sm font-bold">Change Image</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleQuickView}
                            className="absolute bottom-3 right-3 z-20 bg-white/80 backdrop-blur-sm text-primary p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                            aria-label="Quick view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    <img src={product.imageUrls[currentImageIndex] || 'https://picsum.photos/seed/placeholder/600/600'} alt={product.name} className="w-full h-48 sm:h-64 object-cover" loading="lazy" decoding="async" />
                    {product.imageUrls.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-70 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-black/60 z-20" aria-label="Previous image">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-70 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-black/60 z-20" aria-label="Next image">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                {product.imageUrls.map((_, index) => (
                                    <button key={index} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }} className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white'}`}></button>
                                ))}
                            </div>
                        </>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {isOutOfStock && (
                            <span className="text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-lg bg-gray-800">
                                Out of Stock
                            </span>
                        )}
                        {isLowStock && (
                            <span className="text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-lg bg-red-500 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Low Stock
                            </span>
                        )}
                        {isInStock && (
                             <span className="text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-lg bg-green-600">
                                In Stock
                            </span>
                        )}
                        {product.tags?.map(tag => (
                            <span key={tag} className={`text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-lg ${tagColors[tag] || 'bg-gray-500'}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    {strikethroughPrice && discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10 transform group-hover:scale-110 transition-transform duration-200">
                            {discountPercentage}% OFF
                        </div>
                    )}
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-grow cursor-pointer">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-primary mb-2 select-none cursor-default">{product.name}</h3>
                    <p className="text-gray-600 text-sm flex-grow mb-4 select-none cursor-default">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                        <div>
                            {strikethroughPrice ? (
                                <div className="flex items-baseline">
                                    <p className="text-lg font-bold text-red-600">₹{displayPrice.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500 line-through ml-2">₹{strikethroughPrice.toFixed(2)}</p>
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-primary">₹{displayPrice.toFixed(2)}</p>
                            )}
                        </div>
                         <div className="flex items-center">
                            {product.stock > 0 ? (
                                <div className="flex items-center">
                                    <div className="flex items-center border border-gray-200 rounded-md">
                                        <button onClick={handleDecrement} disabled={quantity <= 1} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md disabled:opacity-50" aria-label="Decrease quantity">&minus;</button>
                                        <span className="px-2 font-semibold text-primary text-sm w-8 text-center">{quantity}</span>
                                        <button onClick={handleIncrement} disabled={quantity >= maxAllowedQuantity} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md disabled:opacity-50" aria-label="Increase quantity">+</button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="bg-primary text-white p-2 rounded-full hover:bg-accent hover:text-primary transition-all duration-300 ml-2"
                                        aria-label="Add to cart"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleNotifyMe}
                                    disabled={isSubscribed}
                                    className="bg-primary text-white text-xs px-3 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubscribed ? 'Subscribed' : 'Notify Me'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
