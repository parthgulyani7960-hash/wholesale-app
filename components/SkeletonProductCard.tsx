
import React from 'react';

const SkeletonProductCard: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative animate-pulse">
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            <div className="relative">
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="h-5 w-20 bg-gray-300 rounded-md"></div>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
                <div className="mt-auto flex items-center justify-between">
                    <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonOrderRow: React.FC = () => {
    return (
        <tr className="border-b border-gray-200 animate-pulse">
            <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
            <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
            <td className="py-3 px-4">
                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </td>
            <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
            <td className="py-3 px-4 text-center"><div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div></td>
            <td className="py-3 px-4 text-center"><div className="h-6 w-20 bg-gray-200 rounded-full mx-auto"></div></td>
            <td className="py-3 px-4">
                <div className="flex gap-2 justify-center">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
            </td>
        </tr>
    );
};

export const SkeletonAdminCard: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
        </div>
    );
};

export default SkeletonProductCard;