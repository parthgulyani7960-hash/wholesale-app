

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order } from '../types';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ReviewForm from '../components/ReviewForm';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

interface ProductDetailViewProps {
    product: Product;
    allProducts: Product[];
    orders: Order[];
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, allProducts, orders }) => {
    const { setView, subscribeToOutOfStock, addToCart, cartItems, addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const [activeImageUrl, setActiveImageUrl] = useState(product.imageUrls[0]);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    useEffect(() => {
        setActiveImageUrl(product.imageUrls[0]);
        setQuantity(1);
    }, [product]);

    const hasPurchased = useMemo(() => {
        if (!currentUser) return false;
        return orders
            .filter(o => o.user.email === currentUser.email && o.status === 'Delivered')
            .some(o => o.items.some(item => item.id === product.id));
    }, [currentUser, orders, product.id]);

    const totalPurchasedByUser = useMemo(() => {
        if (!currentUser) return 0;
        return orders
            .filter(o => o.user.email === currentUser.email && o.status === 'Delivered')
            .flatMap(o => o.items)
            .filter(item => item.id === product.id)
            .reduce((total, item) => total + item.quantity, 0);
    }, [currentUser, orders, product.id]);
    
    const isWholesaler = currentUser?.role === 'wholesaler';
    const displayPrice = isWholesaler ? product.wholesalePrice : (product.discountPrice ?? product.price);
    const strikethroughPrice = !isWholesaler && product.discountPrice ? product.price : null;

    const isWishlisted = isInWishlist(product.id);
    const outOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= (product.reorderPoint || 5);

    const itemInCart = cartItems.find(item => item.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    const maxAllowedPerOrder = product.maxOrderQuantity || Infinity;
    
    const remainingStock = product.stock - quantityInCart;
    const remainingAllowedInOrder = maxAllowedPerOrder - quantityInCart;
    
    const maxQuantityToAdd = Math.max(0, Math.min(remainingStock, remainingAllowedInOrder));

    const handleWishlistToggle = () => {
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };
    
    const handleShare = () => {
        const text = `Check out this product from Hind General Store: ${product.name}!`;
        const url = window.location.href; // In a real app, this would be the canonical product URL
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
        window.open(whatsappUrl, '_blank');
    };

    const relatedProducts = allProducts
        .filter(p => p.isListed === true && p.category === product.category && p.id !== product.id)
        .slice(0, 4);
    
    const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;

    const handleIncrement = () => {
        setQuantity(q => Math.min(q + 1, maxQuantityToAdd));
    };

    const handleDecrement = () => {
        setQuantity(q => Math.max(q - 1, 1));
    };
    
    const handleNotifyMe = () => {
        subscribeToOutOfStock(product.id, currentUser);
    };

    const tagColors: { [key: string]: string } = {
        'On Sale': 'bg-red-500',
        'New Arrival': 'bg-blue-500',
        'Best Seller': 'bg-yellow-500 text-black',
        'Organic': 'bg-green-500',
        'Local Favorite': 'bg-orange-500',
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <button 
                onClick={() => setView('products')} 
                className="mb-8 inline-flex items-center text-primary hover:text-accent transition-colors duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Collection
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg relative">
                        <img src={activeImageUrl} alt={product.name} className="w-full h-auto object-cover rounded-md" />
                         <div className="absolute top-6 left-6 flex flex-col gap-2">
                            {product.tags?.map(tag => (
                                <span key={tag} className={`text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg ${tagColors[tag] || 'bg-gray-500'}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    {product.imageUrls.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto p-2">
                            {product.imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Thumbnail ${index + 1}`}
                                    onClick={() => setActiveImageUrl(url)}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${activeImageUrl === url ? 'border-accent scale-105' : 'border-transparent hover:border-accent/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <span className="text-sm font-medium bg-secondary text-accent px-3 py-1 rounded-full">{product.category}</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary my-4 select-none cursor-default">{product.name}</h1>
                    
                    {product.reviews.length > 0 && (
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-current' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-gray-600 ml-2 text-sm">({product.reviews.length} reviews)</span>
                        </div>
                    )}

                    <p className="text-gray-600 text-lg leading-relaxed mb-6 select-none cursor-default">{product.description}</p>
                    
                    {currentUser && totalPurchasedByUser > 0 && (
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-6 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                            <span>You have purchased <b>{totalPurchasedByUser}</b> of this item before.</span>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                             {strikethroughPrice ? (
                                <div className="flex items-baseline gap-3">
                                    <p className="text-3xl font-bold text-red-600">₹{displayPrice.toFixed(2)}</p>
                                    <p className="text-xl text-gray-500 line-through">₹{strikethroughPrice.toFixed(2)}</p>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-primary">₹{displayPrice.toFixed(2)}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                             <button onClick={handleShare} className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors" aria-label="Share on WhatsApp">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
                            </button>
                            <button onClick={handleWishlistToggle} className={`p-3 rounded-full transition-colors duration-300 ${isWishlisted ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {maxQuantityToAdd <= 0 && product.stock > 0 && (
                            <p className="text-red-600 text-sm font-semibold text-center bg-red-50 p-3 rounded-md">
                                You have reached the order limit ({product.maxOrderQuantity}) for this item in your cart.
                            </p>
                        )}
                        {!outOfStock && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-200 rounded-md">
                                    <button onClick={handleDecrement} disabled={quantity <= 1} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-md disabled:opacity-50" aria-label="Decrease quantity">&minus;</button>
                                    <span className="px-4 font-semibold text-primary w-12 text-center">{quantity}</span>
                                    <button onClick={handleIncrement} disabled={quantity >= maxQuantityToAdd} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-md disabled:opacity-50" aria-label="Increase quantity">+</button>
                                </div>
                                <button
                                    onClick={() => addToCart(product, quantity)}
                                    disabled={outOfStock || maxQuantityToAdd <= 0}
                                    className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        )}
                        {outOfStock ? (
                            <button
                                onClick={handleNotifyMe}
                                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-accent hover:text-primary transition-colors"
                            >
                                Notify Me When Available
                            </button>
                        ) : isLowStock && (
                             <p className="text-orange-600 text-sm text-center font-semibold">Hurry! Only {product.stock} left in stock.</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="mt-16">
                 <h2 className="text-3xl font-serif font-bold mb-8 text-primary">Reviews</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        {product.reviews.length > 0 ? (
                            product.reviews.map(review => (
                                <div key={review.id} className="border-b pb-6">
                                    <div className="flex items-center mb-2">
                                         <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                                        <p className="ml-3 font-semibold">{review.userName}</p>
                                    </div>
                                    <p className="text-gray-600 italic">"{review.comment}"</p>
                                    <p className="text-xs text-gray-400 mt-1">{review.date.toLocaleDateString()}</p>
                                    {review.response && (
                                        <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg border-l-4 border-accent">
                                            <p className="font-bold text-xs text-primary">Admin Response</p>
                                            <p className="text-gray-600 text-sm">{review.response}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                        )}
                    </div>
                    {currentUser ? (
                        hasPurchased ? (
                            <ReviewForm productId={product.id} />
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p>You must purchase this product to leave a review.</p>
                            </div>
                        )
                    ) : (
                         <div className="bg-gray-50 p-6 rounded-lg text-center">
                            <p>You must be logged in to leave a review.</p>
                            <button onClick={() => setView('login')} className="text-accent font-bold hover:underline mt-2">Login now</button>
                        </div>
                    )}
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-3xl font-serif font-bold text-center mb-10 text-primary">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
                    </div>
                </div>
            )}
            
            <ProductQuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
};

export default ProductDetailView;
