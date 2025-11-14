
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { setView, storeInfo, currentUser } = useAppContext();
    const { t } = useTranslation();

    return (
        <footer className="bg-primary text-secondary py-6 absolute bottom-0 w-full">
            <div className="container mx-auto px-6 text-center">
                 <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-2">
                    <button onClick={() => setView('home')} className="hover:text-white transition-colors">{t('navHome')}</button>
                    <span>|</span>
                    <button onClick={() => setView('contact')} className="hover:text-white transition-colors">{t('navContact')}</button>
                    <span>|</span>
                    {currentUser && (
                        <>
                        <button onClick={() => setView('support')} className="hover:text-white transition-colors">{t('support')}</button>
                        <span>|</span>
                        </>
                    )}
                    <button onClick={() => setView('help')} className="hover:text-white transition-colors">{t('helpAndFAQs')}</button>
                    <span>|</span>
                    <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">{t('privacyPolicy')}</button>
                     <span>|</span>
                    <button onClick={() => setView('terms')} className="hover:text-white transition-colors">{t('termsOfService')}</button>
                </div>
                <p>&copy; {new Date().getFullYear()} {storeInfo.name}. All Rights Reserved.</p>
                <p className="text-sm mt-1">Contact us: {storeInfo.phone}</p>
            </div>
        </footer>
    );
};

export default Footer;
