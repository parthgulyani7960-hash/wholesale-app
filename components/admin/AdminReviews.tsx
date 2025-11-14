
import React, { useMemo, useState } from 'react';
import { Product, Review } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../Modal';

interface AdminReviewsProps {
    products: Product[];
}

interface ProductReview extends Review {
    productName: string;
    productId: number;
}

const AdminReviews: React.FC<AdminReviewsProps> = ({ products }) => {
    const { addReviewResponse } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
    const [responseText, setResponseText] = useState('');

    const allReviews = useMemo((): ProductReview[] => {
        return products
            .flatMap(product =>
                product.reviews.map(review => ({
                    ...review,
                    productName: product.name,
                    productId: product.id,
                }))
            )
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [products]);

    const handleOpenModal = (review: ProductReview) => {
        setSelectedReview(review);
        setResponseText(review.response || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
        setResponseText('');
    };

    const handleSubmitResponse = () => {
        if (selectedReview && responseText.trim()) {
            addReviewResponse(selectedReview.productId, selectedReview.id, responseText.trim());
            handleCloseModal();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Customer Reviews</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Product</th>
                            <th className="py-3 px-4 text-left">Customer</th>
                            <th className="py-3 px-4 text-center">Rating</th>
                            <th className="py-3 px-4 text-left">Comment</th>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {allReviews.map(review => (
                            <tr key={`${review.productId}-${review.id}`} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4 text-left font-semibold">{review.productName}</td>
                                <td className="py-3 px-4 text-left">{review.userName}</td>
                                <td className="py-3 px-4 text-center">
                                     <div className="flex justify-center text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-left max-w-sm">
                                    <p>{review.comment}</p>
                                    {review.response && (
                                        <div className="mt-2 p-2 bg-gray-100 rounded-md border-l-2 border-accent">
                                            <p className="text-xs font-bold text-gray-600">Your Response:</p>
                                            <p className="text-xs italic text-gray-800">"{review.response}"</p>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-left">{review.date.toLocaleDateString()}</td>
                                <td className="py-3 px-4 text-center">
                                    <button onClick={() => handleOpenModal(review)} className="text-accent hover:underline text-xs font-semibold">
                                        {review.response ? 'Edit Response' : 'Respond'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {allReviews.length === 0 && (
                <p className="text-center p-8 text-gray-500">No customer reviews yet.</p>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Respond to ${selectedReview?.userName}`}>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="font-semibold text-sm">"{selectedReview?.comment}"</p>
                    </div>
                    <div>
                        <label htmlFor="response" className="block text-sm font-medium text-gray-700">Your Response</label>
                        <textarea
                            id="response"
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            placeholder="Write your response here..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSubmitResponse} className="bg-primary text-white px-5 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300">
                            Submit Response
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminReviews;
