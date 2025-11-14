import React, { useState, useEffect, useMemo } from 'react';
import { Order, UserDetails, CartItem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../Modal';

interface AdminOrderEditModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const AdminOrderEditModal: React.FC<AdminOrderEditModalProps> = ({ order, isOpen, onClose }) => {
    const { updateOrder, products, addInternalOrderNote, users, currentUser } = useAppContext();
    const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', email: '', mobile: '', shopName: '', address: '', pincode: '' });
    const [items, setItems] = useState<CartItem[]>([]);
    const [productToAdd, setProductToAdd] = useState<string>('');
    const [internalNote, setInternalNote] = useState('');

    useEffect(() => {
        if (order) {
            setUserDetails(order.user);
            setItems(order.items.map(item => ({ ...item })));
        }
    }, [order]);

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleItemQuantityChange = (itemId: number, quantity: number) => {
        if (quantity < 1) return;
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
    };

    const handleRemoveItem = (itemId: number) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
    };
    
    const handleAddItem = () => {
        const selectedProduct = products.find(p => p.id === parseInt(productToAdd, 10));
        if (selectedProduct && order) {
            const orderUser = users.find(u => u.email === order.user.email);
            const userRole = orderUser?.role || 'retailer';

            // Correctly apply wholesale price even if it is 0
            let priceAtTimeOfCart;
            if (userRole === 'wholesaler' && selectedProduct.wholesalePrice !== undefined && selectedProduct.wholesalePrice !== null) {
                priceAtTimeOfCart = selectedProduct.wholesalePrice;
            } else {
                priceAtTimeOfCart = selectedProduct.discountPrice ?? selectedProduct.price;
            }
            
            const existingItem = items.find(item => item.id === selectedProduct.id);
            if (existingItem) {
                handleItemQuantityChange(selectedProduct.id, existingItem.quantity + 1);
            } else {
                const newCartItem: CartItem = {
                    ...selectedProduct,
                    quantity: 1,
                    priceAtTimeOfCart,
                };
                setItems(prev => [...prev, newCartItem]);
            }
        }
        setProductToAdd('');
    };

    const handleAddNote = () => {
        if (!order || !internalNote.trim() || !currentUser) return;
        addInternalOrderNote(order.id, internalNote.trim(), currentUser.name);
        setInternalNote('');
        const updatedOrder = { ...order };
        const newNote = { note: internalNote.trim(), author: currentUser.name, date: new Date() };
        updatedOrder.internalNotes = [...(updatedOrder.internalNotes || []), newNote];
    }

    const calculatedTotal = useMemo(() => {
        return items.reduce((total, item) => {
            return total + item.priceAtTimeOfCart * item.quantity;
        }, 0);
    }, [items]);

    const handleSaveChanges = () => {
        if (!order) return;
        const updatedOrder: Order = {
            ...order,
            user: userDetails,
            items,
            total: calculatedTotal,
            internalNotes: order.internalNotes
        };
        updateOrder(updatedOrder);
        onClose();
    };
    
    if (!isOpen || !order) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Order #${order.id}`}>
            <div className="space-y-6">
                <fieldset className="border p-4 rounded-md">
                    <legend className="px-2 font-semibold text-gray-700">Customer Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" value={userDetails.name} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={userDetails.email} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input type="tel" name="mobile" value={userDetails.mobile} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                            <input type="text" name="shopName" value={userDetails.shopName} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea name="address" value={userDetails.address} onChange={handleUserChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"></textarea>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Pincode</label>
                            <input type="text" name="pincode" value={userDetails.pincode} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                    </div>
                </fieldset>
                
                {order.customerNotes && (
                     <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Customer Notes</legend>
                        <p className="text-sm text-gray-800 italic">"{order.customerNotes}"</p>
                    </fieldset>
                )}

                <fieldset className="border p-4 rounded-md">
                    <legend className="px-2 font-semibold text-gray-700">Order Items</legend>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center space-x-2 text-sm">
                                <img src={item.imageUrls[0]} alt={item.name} className="w-10 h-10 object-cover rounded"/>
                                <span className="flex-grow font-medium">{item.name}</span>
                                <input type="number" value={item.quantity} onChange={e => handleItemQuantityChange(item.id, parseInt(e.target.value, 10))} className="w-16 text-center border rounded" />
                                <span>@ ₹{(item.priceAtTimeOfCart).toFixed(2)}</span>
                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">&times;</button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                        <select value={productToAdd} onChange={e => setProductToAdd(e.target.value)} className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-accent"><option value="">Select a product to add...</option>{products.filter(p => !items.some(i => i.id === p.id)).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                         <button onClick={handleAddItem} disabled={!productToAdd} className="bg-primary text-white px-3 py-1 rounded disabled:bg-gray-400 text-sm">Add</button>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="px-2 font-semibold text-gray-700">Internal Notes</legend>
                    <div className="space-y-2 text-xs max-h-24 overflow-y-auto mb-2 pr-2">
                        {order.internalNotes && order.internalNotes.length > 0 ? (
                            order.internalNotes.map((note, index) => (
                                <div key={index} className="bg-gray-100 p-2 rounded">
                                    <p className="font-semibold">{note.author} <span className="text-gray-500 font-normal">- {note.date.toLocaleString()}</span></p>
                                    <p className="text-gray-800">{note.note}</p>
                                </div>
                            ))
                        ) : (<p className="text-gray-500">No internal notes for this order.</p>)}
                    </div>
                    <div className="mt-2 pt-2 border-t flex gap-2">
                        <input type="text" value={internalNote} onChange={e => setInternalNote(e.target.value)} placeholder="Add a new note..." className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-accent"/>
                        <button onClick={handleAddNote} disabled={!internalNote.trim()} className="bg-primary text-white px-3 py-1 rounded disabled:bg-gray-400 text-sm">Add Note</button>
                    </div>
                </fieldset>

                 <div className="text-right font-bold text-xl">New Total: ₹{calculatedTotal.toFixed(2)}</div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleSaveChanges} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300">Save Changes</button>
                </div>
            </div>
        </Modal>
    );
};

export default AdminOrderEditModal;