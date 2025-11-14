
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext, View } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onCartClick: () => void;
    onLocationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onLocationClick }) => {
    const { view, setView, sessionPincode, itemCount, wishlistItems, currentUser, logout } = useAppContext();
    const { t } = useTranslation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);

    const unreadNotificationCount = useMemo(() => {
        return currentUser?.notifications?.filter(n => !n.read).length || 0;
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
                setIsMobileMenuOpen(false);
            } else if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuRef, headerRef]);
    
    const handleMobileLinkClick = (targetView: View) => {
        setView(targetView);
        setIsMobileMenuOpen(false);
    };

    const NavLink: React.FC<{ targetView: View, children: React.ReactNode, isMobile?: boolean }> = ({ targetView, children, isMobile = false }) => (
        <button
            onClick={() => isMobile ? handleMobileLinkClick(targetView) : setView(targetView)}
            className={`transition-colors duration-300 relative group ${ isMobile 
                ? `px-4 py-3 text-left w-full ${view === targetView ? 'bg-accent/20 text-accent' : 'text-secondary hover:bg-primary'}` 
                : `px-4 py-2 ${view === targetView ? 'text-accent' : 'text-secondary hover:text-white'}`}`}
        >
            {children}
            {!isMobile && <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${view === targetView ? 'scale-x-100' : ''}`}></span>}
        </button>
    );

    return (
        <>
            <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-secondary shadow-lg backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-xl sm:text-2xl font-serif font-bold cursor-pointer text-white" onClick={() => setView('home')}>
                            Hind General Store
                        </div>
                         <div onClick={onLocationClick} className="location-selector cursor-pointer flex items-center gap-2 group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="text-left leading-tight hidden sm:block">
                                <span className="text-xs text-gray-300 block group-hover:text-accent transition-colors">{sessionPincode ? t('deliverTo') : 'Hello'}</span>
                                <span className="font-semibold text-sm text-white">{sessionPincode || t('selectAddress')}</span>
                            </div>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center space-x-2">
                        <NavLink targetView="home">{t('navHome')}</NavLink>
                        <NavLink targetView="products">{t('navProducts')}</NavLink>
                        <NavLink targetView="contact">{t('navContact')}</NavLink>
                        {currentUser && (
                            <NavLink targetView="orderHistory">{t('navMyOrders')}</NavLink>
                        )}
                    </nav>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                         {currentUser && (
                            <button onClick={() => setView('notifications')} className="relative text-secondary hover:text-white transition-colors duration-300 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {unreadNotificationCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button onClick={() => setView('wishlist')} className="relative text-secondary hover:text-white transition-colors duration-300 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                            </svg>
                            {wishlistItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </button>
                        <button onClick={onCartClick} className="relative text-secondary hover:text-white transition-colors duration-300 p-1">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                         {currentUser ? (
                            <div className="relative hidden md:block" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                                    className="flex items-center space-x-2 text-secondary hover:text-white transition-colors cursor-pointer"
                                >
                                    <span>{t('hiUser', { name: currentUser.name.split(' ')[0] })}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-primary animate-fade-in-fast">
                                        <button onClick={() => { setView('myAccount'); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">{t('myAccount')}</button>
                                        <button onClick={() => { setView('settings'); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">{t('settings')}</button>
                                        <button onClick={() => { logout(); setView('home'); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">{t('logout')}</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <button onClick={() => setView('login')} className="bg-accent text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-opacity-80 transition-all duration-300 text-sm font-medium">
                                {t('login')}
                            </button>
                        )}
                         <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="text-secondary hover:text-white p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
                 {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-primary/95 shadow-lg animate-fade-in-fast">
                        <nav className="flex flex-col py-2">
                             <NavLink targetView="home" isMobile>{t('navHome')}</NavLink>
                             <NavLink targetView="products" isMobile>{t('navProducts')}</NavLink>
                             <NavLink targetView="contact" isMobile>{t('navContact')}</NavLink>
                            {currentUser ? (
                                <>
                                    <NavLink targetView="orderHistory" isMobile>{t('navMyOrders')}</NavLink>
                                    <NavLink targetView="myAccount" isMobile>{t('myAccount')}</NavLink>
                                    <button onClick={() => { logout(); handleMobileLinkClick('home'); }} className="px-4 py-3 text-left w-full text-secondary hover:bg-primary">{t('logout')}</button>
                                </>
                            ) : (
                                <NavLink targetView="login" isMobile>{t('login')}</NavLink>
                            )}
                        </nav>
                    </div>
                )}
                 <style>{`
                    @keyframes fadeInFast {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-fast {
                        animation: fadeInFast 0.2s ease-out forwards;
                    }
                `}</style>
            </header>
        </>
    );
};

export default Header;
