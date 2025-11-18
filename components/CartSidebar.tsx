
import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import CheckoutForm from './CheckoutForm';
import { Order } from '../types';
import { useAppContext } from '../context/AppContext';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, orders }) => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, itemCount, currentUser, setView } = useAppContext();
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const isFirstOrder = useMemo(() => {
        if (!currentUser) return false;
        return !orders.some(order => order.user.email === currentUser.email);
    }, [currentUser, orders]);

    const handleCheckoutSuccess = () => {
        setIsCheckoutModalOpen(false);
        onClose(); // Close the cart sidebar as well
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black z-[60] transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} 
                onClick={onClose}
            ></div>
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-light shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center p-5 border-b bg-white">
                    <h2 className="text-2xl font-serif font-bold text-primary">Your Cart ({itemCount})</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {cartItems.length > 0 ? (
                    <>
                        <div className="flex-grow p-5 overflow-y-auto">
                            <div className="space-y-4">
                                {cartItems.map(item => {
                                    const maxAllowed = item.maxOrderQuantity || Infinity;
                                    return (
                                        <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                                            <img src={item.imageUrls[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-primary">{item.name}</p>
                                                <p className="text-sm text-gray-500">₹{item.priceAtTimeOfCart.toFixed(2)}</p>
                                                <div className="flex items-center mt-2">
                                                    <div className="flex items-center border border-gray-200 rounded-md">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600 rounded-l-md hover:bg-gray-100 disabled:opacity-50">&minus;</button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (!isNaN(val) && val > 0) {
                                                                    updateQuantity(item.id, val);
                                                                }
                                                            }}
                                                            className="w-12 text-center text-sm font-semibold border-x border-gray-200 focus:outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= Math.min(item.stock, maxAllowed)} className="px-2 py-1 text-gray-600 rounded-r-md hover:bg-gray-100 disabled:opacity-50">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold self-start">&times;</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-5 border-t bg-white">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                                <span className="text-2xl font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if(currentUser) {
                                        setIsCheckoutModalOpen(true);
                                    } else {
                                        onClose();
                                        setView('login');
                                    }
                                }}
                                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-accent hover:text-primary transition-colors"
                            >
                                {currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-5 text-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-4">Add some products to get started.</p>
                        <button
                            onClick={onClose}
                            className="bg-accent text-primary font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
             <Modal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} title="Checkout">
                <CheckoutForm onCheckoutSuccess={handleCheckoutSuccess} isFirstOrder={isFirstOrder} />
            </Modal>
        </>
    );
};

export default CartSidebar;
