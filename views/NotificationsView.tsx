

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Notification } from '../types';

const NotificationsView: React.FC = () => {
    const { currentUser, setView, updateUser } = useAppContext();

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        const updatedNotifications = currentUser?.notifications?.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
        );
        if (currentUser) {
            updateUser({ id: currentUser.id, notifications: updatedNotifications });
        }
        
        // Navigate if there's a link
        if (notification.link) {
            setView(notification.link.view);
        }
    };
    
    const markAllAsRead = () => {
        const updatedNotifications = currentUser?.notifications?.map(n => ({...n, read: true}));
        if (currentUser) {
            updateUser({ id: currentUser.id, notifications: updatedNotifications });
        }
    }

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-serif font-bold text-primary">Notifications</h1>
                {currentUser?.notifications && currentUser.notifications.some(n => !n.read) && (
                     <button onClick={markAllAsRead} className="text-sm text-accent hover:underline font-semibold">
                        Mark all as read
                    </button>
                )}
            </div>
            
            <div className="max-w-3xl mx-auto">
                {currentUser?.notifications && currentUser.notifications.length > 0 ? (
                    <div className="space-y-4">
                        {currentUser.notifications.map(notification => (
                             <div 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-5 rounded-lg transition-all duration-300 flex items-start gap-4 ${
                                    notification.read ? 'bg-white shadow-sm' : 'bg-accent/10 border border-accent shadow-md cursor-pointer hover:bg-accent/20'
                                }`}
                            >
                                <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 ${notification.read ? 'bg-transparent' : 'bg-primary'}`}></div>
                                <div className="flex-grow">
                                    <p className="text-primary">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notification.date.toLocaleString()}</p>
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-10 rounded-lg shadow-md">
                        <p className="text-gray-500 text-lg">You have no notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;
