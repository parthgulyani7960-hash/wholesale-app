
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../Modal';

interface AdminKhataModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const AdminKhataModal: React.FC<AdminKhataModalProps> = ({ user, isOpen, onClose }) => {
    const { updateUserKhata, storeInfo, paymentDetails, showNotification, sendUserNotification } = useAppContext();
    const [hasCredit, setHasCredit] = useState(false);
    const [creditLimit, setCreditLimit] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setHasCredit(user.hasCredit || false);
            setCreditLimit(user.creditLimit?.toString() || '0');
            setDueDate(user.khataDueDate ? user.khataDueDate.toISOString().split('T')[0] : '');
        }
    }, [user]);

    // This is a simplified calculation. A real app might need to fetch live order data.
    const khataBalance = 0; // Placeholder for balance calculation

    const handleRequestPayment = () => {
        if (!user || !storeInfo.whatsapp) return;
        const message = `Hello ${user.name},\n\nThis is a friendly reminder from ${storeInfo.name} regarding your Khata payment.\n\nTo continue using the service, please clear any outstanding dues.\n\nYou can pay via UPI to:\nUPI ID: ${paymentDetails.upiId}\n\nPlease send us a screenshot of the payment confirmation.\n\nThank you!`;
        const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        const notificationMessage = `Hello ${user.name}, this is a reminder to clear your Khata dues with ${storeInfo.name}. Thank you!`;
        sendUserNotification(user.id, notificationMessage);
        showNotification('WhatsApp message prepared and in-app notification sent.');
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        const limit = parseInt(creditLimit, 10) || 0;
        const newDueDate = dueDate ? new Date(dueDate) : undefined;
        
        await updateUserKhata(user.id, hasCredit, limit, newDueDate);
        setIsSaving(false);
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Khata for ${user.name}`}>
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <label htmlFor="hasCredit" className="font-semibold text-gray-800">Enable Khata Access</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="hasCredit" 
                            className="sr-only peer"
                            checked={hasCredit}
                            onChange={(e) => setHasCredit(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-accent/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                
                {hasCredit && (
                    <div className="space-y-4 animate-fade-in-fast">
                        <div>
                            <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">Credit Limit (₹)</label>
                            <input 
                                type="number" 
                                id="creditLimit"
                                value={creditLimit}
                                onChange={(e) => setCreditLimit(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                            />
                        </div>
                         <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Payment Due Date</label>
                            <input 
                                type="date" 
                                id="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                            />
                        </div>
                         <div className="pt-2">
                             <button
                                onClick={handleRequestPayment}
                                className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
                                Request Payment via WhatsApp
                            </button>
                         </div>
                    </div>
                )}
                
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300 disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                 <style>{`
                    @keyframes fadeInFast {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-fast {
                        animation: fadeInFast 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </Modal>
    );
};

export default AdminKhataModal;
