import React, { useState } from 'react';
import { User } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../Modal';

interface AdminWalletModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const AdminWalletModal: React.FC<AdminWalletModalProps> = ({ user, isOpen, onClose }) => {
    const { updateUserWallet } = useAppContext();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!user) return null;

    const handleTransaction = async (transactionType: 'add' | 'deduct') => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !reason.trim()) {
            alert('Please enter a valid amount and reason.');
            return;
        }

        setIsSaving(true);
        const finalAmount = transactionType === 'add' ? numericAmount : -numericAmount;
        await updateUserWallet(user.id, finalAmount, reason);
        
        setIsSaving(false);
        setAmount('');
        setReason('');
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Wallet for ${user.name}`}>
            <div className="space-y-6">
                <div className="text-center bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Current Wallet Balance</p>
                    <p className="text-3xl font-bold text-green-600">₹{(user.walletBalance || 0).toFixed(2)}</p>
                </div>
                
                <div className="space-y-4 border-t pt-4">
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                        <input 
                            type="number" 
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 100.00"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                        />
                    </div>
                     <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Transaction</label>
                        <input 
                            type="text" 
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Refund for Order #12345"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                        />
                    </div>
                </div>
                
                <div className="flex justify-end pt-4 gap-3">
                    <button 
                        onClick={() => handleTransaction('deduct')}
                        disabled={isSaving}
                        className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 disabled:bg-gray-400"
                    >
                        {isSaving ? '...' : 'Deduct Funds'}
                    </button>
                    <button 
                        onClick={() => handleTransaction('add')}
                        disabled={isSaving}
                        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300 disabled:bg-gray-400"
                    >
                        {isSaving ? '...' : 'Add Funds'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AdminWalletModal;