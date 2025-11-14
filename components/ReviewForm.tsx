

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface ReviewFormProps {
    productId: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
    const { addReview, currentUser } = useAppContext();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !comment.trim() || !currentUser) return;
        
        setIsSubmitting(true);
        await addReview(productId, {
            userName: currentUser.name,
            rating,
            comment,
        });
        
        setIsSubmitting(false);
        setRating(0);
        setComment('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-serif text-xl font-bold mb-4">Leave a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="text-2xl text-gray-300 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${(hoverRating || rating) >= star ? 'text-yellow-400' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Comment</label>
                    <textarea
                        id="comment"
                        name="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        required
                    ></textarea>
                </div>
                <div className="text-right">
                    <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-5 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300 disabled:bg-gray-400">
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
