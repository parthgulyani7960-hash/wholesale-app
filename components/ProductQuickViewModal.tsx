import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from './Modal';

interface ProductQuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ product, isOpen, onClose }) => {
    // FIX: Replaced useAuth and useCart with useAppContext
    const { viewProduct, addToCart, cartItems, currentUser } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const [activeImageUrl, setActiveImageUrl] = useState('');

    useEffect(() => {
        if (product) {
            setActiveImageUrl(product.imageUrls[0]);
            setQuantity(1);
        }
    }, [product]);

    if (!product) return null;

    const itemInCart = useMemo(() => cartItems.find(item => item.id === product.id), [cartItems, product.id]);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;

    const maxAllowedPerOrder = product.maxOrderQuantity || Infinity;
    const remainingStock = product.stock - quantityInCart;
    const remainingAllowedInOrder = maxAllowedPerOrder - quantityInCart;
    const maxQuantityToAdd = Math.max(0, Math.min(remainingStock, remainingAllowedInOrder));

    // FIX: Made pricing logic consistent with other components
    const isWholesaler = currentUser?.role === 'wholesaler';
    const displayPrice = isWholesaler ? product.wholesalePrice : (product.discountPrice ?? product.price);
    const strikethroughPrice = !isWholesaler && product.discountPrice ? product.price : null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        onClose();
    };
    
    const handleViewFullDetails = () => {
        viewProduct(product.id);
        onClose();
    };

    return (
        // FIX: Improved modal title
        <Modal isOpen={isOpen} onClose={onClose} title={product.name}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Gallery */}
                <div className="space-y-3">
                    <img src={activeImageUrl} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
                    {product.imageUrls.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto p-1">
                            {product.imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Thumb ${index}`}
                                    onClick={() => setActiveImageUrl(url)}
                                    className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${activeImageUrl === url ? 'border-accent' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <h2 className="text-3xl font-serif font-bold text-primary mb-2">{product.name}</h2>
                    <p className="text-gray-500 text-sm mb-4">{product.description.substring(0, 150)}...</p>
                    
                    {/* Price */}
                    <div>
                        {strikethroughPrice ? (
                            <div className="flex items-baseline gap-3 mb-4">
                                <p className="text-3xl font-bold text-red-600">₹{displayPrice.toFixed(2)}</p>
                                <p className="text-xl text-gray-500 line-through">₹{strikethroughPrice.toFixed(2)}</p>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-primary mb-4">₹{displayPrice.toFixed(2)}</p>
                        )}
                    </div>

                    {/* Stock and Actions */}
                    <div className="mt-auto pt-4 space-y-4">
                        {product.stock > 0 ? (
                            <>
                                <p className="text-sm font-semibold text-green-600">In Stock ({product.stock} available)</p>
                                {maxQuantityToAdd <= 0 && (
                                     <p className="text-red-500 text-xs font-semibold">
                                        You've reached the order limit ({product.maxOrderQuantity}) for this item.
                                    </p>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button onClick={() => setQuantity(q => Math.max(q - 1, 1))} className="px-3 py-2 text-gray-600 rounded-l-md disabled:opacity-50" disabled={quantity <= 1}>&minus;</button>
                                        <span className="px-4 font-semibold">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(q + 1, maxQuantityToAdd))} className="px-3 py-2 text-gray-600 rounded-r-md disabled:opacity-50" disabled={quantity >= maxQuantityToAdd}>+</button>
                                    </div>
                                    <button onClick={handleAddToCart} disabled={maxQuantityToAdd <= 0} className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                        Add to Cart
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-lg font-bold text-red-600">Out of Stock</p>
                        )}
                         <button onClick={handleViewFullDetails} className="w-full text-center text-accent font-semibold hover:underline mt-4 text-sm">
                            View Full Details &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProductQuickViewModal;