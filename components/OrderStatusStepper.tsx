
import React from 'react';
import { OrderStatus } from '../types';

interface OrderStatusStepperProps {
    currentStatus: OrderStatus;
}

const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ currentStatus }) => {
    const statuses: OrderStatus[] = ['Approved', 'Packed', 'Out for Delivery', 'Delivered'];
    
    if (currentStatus === 'Pending') {
        return (
            <div className="text-center p-4 rounded-lg bg-yellow-100 text-yellow-800">
                <p className="font-semibold">Your order is pending approval.</p>
                <p className="text-sm">We will notify you once it has been confirmed.</p>
            </div>
        );
    }
    
    if (currentStatus === 'Rejected') {
        return (
             <div className="text-center p-4 rounded-lg bg-red-100 text-red-800">
                <p className="font-semibold">Your order has been rejected.</p>
                <p className="text-sm">Please contact support for more information.</p>
            </div>
        );
    }

    if (currentStatus === 'Cancelled') {
        return (
             <div className="text-center p-4 rounded-lg bg-red-100 text-red-800">
                <p className="font-semibold">Your order has been cancelled.</p>
                <p className="text-sm">Please contact support if you have any questions.</p>
            </div>
        );
    }

    const currentStatusIndex = statuses.indexOf(currentStatus);

    return (
        <div className="w-full px-2 py-4">
            <div className="flex items-center">
                {statuses.map((status, index) => (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                                    ${index <= currentStatusIndex ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`
                                }
                            >
                                {index < currentStatusIndex ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <p className={`mt-2 text-xs text-center font-medium ${index <= currentStatusIndex ? 'text-primary' : 'text-gray-500'}`}>{status}</p>
                        </div>

                        {index < statuses.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default OrderStatusStepper;