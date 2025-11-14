

import React, { useState, useEffect, useMemo } from 'react';
import { User, Order } from '../types';
import { useAppContext } from '../context/AppContext';

interface MyAccountViewProps {
    userOrders: Order[];
}

const MyAccountView: React.FC<MyAccountViewProps> = ({ userOrders }) => {
    const { currentUser, setView, showNotification, updateUser } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        shopName: '',
        address: '',
        pincode: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                mobile: currentUser.mobile || '',
                shopName: currentUser.shopName || '',
                address: currentUser.address || '',
                pincode: currentUser.pincode || '',
            });
        }
    }, [currentUser]);

    const khataBalance = useMemo(() => {
        if (!currentUser?.hasCredit) return 0;
        return userOrders
            .filter(o => o.paymentMethod === 'Pay on Khata' && o.status !== 'Delivered' && o.status !== 'Rejected')
            .reduce((sum, o) => sum + o.total, 0);
    }, [currentUser, userOrders]);

    const remainingCredit = (currentUser?.creditLimit || 0) - khataBalance;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsSaving(true);
        const updatedData: Partial<User> & { id: number } = {
            id: currentUser.id,
            ...formData,
        };
        
        await updateUser(updatedData);
        setIsSaving(false);
        showNotification("Your information has been updated.");
    };

    if (!currentUser) {
        return <div className="text-center p-12">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="flex justify-center items-center mb-10 relative">
                 <h1 className="text-4xl font-serif font-bold text-center text-primary">My Account</h1>
                 <button 
                    onClick={() => setView('settings')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 text-gray-700 p-3 rounded-full hover:bg-gray-300 transition-colors"
                    title="Go to Settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                 </button>
            </div>
            
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Khata Status */}
                    {currentUser.hasCredit && (
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-primary mb-4">My Khata</h2>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500">Credit Limit</p>
                                    <p className="text-xl font-bold text-primary">₹{currentUser.creditLimit?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Balance Due</p>
                                    <p className="text-xl font-bold text-red-600">₹{khataBalance.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Remaining Credit</p>
                                    <p className="text-xl font-bold text-green-600">₹{remainingCredit.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Due By</p>
                                    <p className="text-md font-bold text-primary">{currentUser.khataDueDate ? currentUser.khataDueDate.toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Wallet Status */}
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">My Wallet</h2>
                        {currentUser.hasWallet ? (
                             <div className="text-center bg-gray-50 p-6 rounded-lg">
                                <p className="text-sm text-gray-500">Available Balance</p>
                                <p className="text-3xl font-bold text-green-600">₹{(currentUser.walletBalance || 0).toFixed(2)}</p>
                            </div>
                        ) : (
                             <div className="text-center bg-gray-50 p-6 rounded-lg">
                                <p className="text-gray-600">You don't have a wallet enabled.</p>
                                <button onClick={() => setView('help')} className="text-sm text-accent font-semibold hover:underline mt-2">Learn how to get one</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                                id="name" name="name" type="text"
                                value={formData.name} onChange={handleChange} required
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 bg-gray-100 cursor-not-allowed"
                                id="email" name="email" type="email"
                                value={formData.email} onChange={handleChange} required disabled
                            />
                        </div>
                        <div>
                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">Mobile Number</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                                id="mobile" name="mobile" type="tel"
                                value={formData.mobile} onChange={handleChange}
                            />
                        </div>
                        <div>
                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopName">Shop Name</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                                id="shopName" name="shopName" type="text"
                                value={formData.shopName} onChange={handleChange}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Default Delivery Address</label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                                id="address" name="address" rows={3}
                                value={formData.address} onChange={handleChange}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pincode">Pincode</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                                id="pincode" name="pincode" type="text"
                                value={formData.pincode} onChange={handleChange}
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-8">
                        <button className="bg-primary hover:bg-accent text-white hover:text-primary font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
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

export default MyAccountView;
