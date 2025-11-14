

import React from 'react';

const SkeletonProductCard: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-50/50 to-transparent"></div>

            <div className="relative">
                {/* Image Placeholder */}
                <div className="w-full h-64 bg-gray-300"></div>
                {/* Tag Placeholder */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="h-5 w-20 bg-gray-400 rounded-md"></div>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                {/* Title Placeholder */}
                <div className="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
                {/* Description Placeholders */}
                <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-300 rounded mb-4"></div>
                {/* Price Placeholder */}
                <div className="mt-auto">
                    <div className="h-8 w-1/3 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonProductCard;