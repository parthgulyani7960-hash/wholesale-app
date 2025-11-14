
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from './Modal';

interface DeliveryReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

const DeliveryReviewModal: React.FC<DeliveryReviewModalProps> = ({ isOpen, onClose, orderId }) => {
    const { addDeliveryReview } = useAppContext();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !comment.trim()) return;

        addDeliveryReview(orderId, { rating, comment });
        
        // Reset and close
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Delivery">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="text-3xl text-gray-300 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'text-yellow-400' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comments</label>
                    <textarea
                        id="comment"
                        name="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="How was the delivery service?"
                        required
                    ></textarea>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300">
                        Submit Review
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default DeliveryReviewModal;