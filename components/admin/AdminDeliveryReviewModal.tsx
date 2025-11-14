
import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../Modal';

interface AdminDeliveryReviewModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const AdminDeliveryReviewModal: React.FC<AdminDeliveryReviewModalProps> = ({ order, isOpen, onClose }) => {
    const { addDeliveryReviewResponse } = useAppContext();
    const [responseText, setResponseText] = useState('');
    
    useEffect(() => {
        if (order?.deliveryReview) {
            setResponseText(order.deliveryReview.response || '');
        }
    }, [order]);

    const handleSubmit = () => {
        if (!order || !responseText.trim()) return;
        addDeliveryReviewResponse(order.id, responseText.trim());
        onClose();
    };

    if (!order || !order.deliveryReview) return null;

    const { deliveryReview, user } = order;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Delivery Review for ${user.name}`}>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < deliveryReview.rating ? 'fill-current' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                        <p className="ml-auto text-sm text-gray-500">{deliveryReview.date.toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-700 italic">"{deliveryReview.comment}"</p>
                </div>
                <div>
                    <label htmlFor="response" className="block text-sm font-medium text-gray-700">Your Response</label>
                    <textarea
                        id="response"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Write your public response here..."
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <button onClick={handleSubmit} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300">
                        {deliveryReview.response ? 'Update Response' : 'Submit Response'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AdminDeliveryReviewModal;