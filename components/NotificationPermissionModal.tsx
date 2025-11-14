import React from 'react';
import Modal from './Modal';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: (allowed: boolean) => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title="Enable Notifications?">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-600 mb-6">
                Get updates on your order status and be the first to know about exclusive promotions!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={() => onClose(false)}
                    className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Maybe Later
                </button>
                <button
                    onClick={() => onClose(true)}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors"
                >
                    Allow Notifications
                </button>
            </div>
        </div>
    </Modal>
  );
};

export default NotificationPermissionModal;
