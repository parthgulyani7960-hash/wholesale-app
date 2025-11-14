

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

const SettingsView: React.FC = () => {
    const { currentUser, logout, setView, storeInfo, updateNotificationPreferences } = useAppContext();
    const { t, i18n } = useTranslation();
    const [prefs, setPrefs] = useState(currentUser?.notificationPreferences || {
        orderStatus: true,
        promotions: true,
        newProducts: true,
    });

    useEffect(() => {
        if (currentUser) {
            setPrefs(currentUser.notificationPreferences || { orderStatus: true, promotions: true, newProducts: true });
        }
    }, [currentUser]);

    const handleToggle = (key: keyof typeof prefs) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        if (currentUser) {
            updateNotificationPreferences(currentUser.id, newPrefs);
        }
    };
    
    const handleLogout = () => {
        logout();
        setView('home');
    }
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    if (!currentUser) return null;

    const isAdmin = currentUser.role === 'owner' || currentUser.role === 'admin';

    const SettingRow: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="flex justify-between items-center py-4 border-b">
            <span className="font-medium text-gray-700">{title}</span>
            <div>{children}</div>
        </div>
    );
    
    const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; id: string }> = ({ checked, onChange, id }) => (
         <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-accent/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    );

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-center mb-10 text-primary">{t('settingsTitle')}</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-serif font-bold text-primary mb-2">{t('appPreferences')}</h2>
                <SettingRow title={t('language')}>
                    <select value={i18n.language} onChange={handleLanguageChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-accent focus:border-accent">
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                    </select>
                </SettingRow>

                <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-2">{t('communication')}</h2>
                 <SettingRow title={t('orderStatusUpdates')}>
                    <ToggleSwitch id="orderStatus" checked={prefs.orderStatus} onChange={() => handleToggle('orderStatus')} />
                </SettingRow>
                <SettingRow title={t('promotionsOffers')}>
                    <ToggleSwitch id="promotions" checked={prefs.promotions} onChange={() => handleToggle('promotions')} />
                </SettingRow>
                <SettingRow title={t('newProductArrivals')}>
                    <ToggleSwitch id="newProducts" checked={prefs.newProducts} onChange={() => handleToggle('newProducts')} />
                </SettingRow>

                {isAdmin && (
                    <>
                        <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-2">{t('admin')}</h2>
                        <SettingRow title={t('adminDashboard')}>
                            <button onClick={() => setView('admin')} className="text-accent hover:underline font-semibold">{t('goToDashboard')}</button>
                        </SettingRow>
                    </>
                )}

                <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-2">{t('informationSupport')}</h2>
                <SettingRow title={t('helpAndFAQs')}>
                    <button onClick={() => setView('help')} className="text-accent hover:underline">{t('view')}</button>
                </SettingRow>
                 <SettingRow title={t('navContact')}>
                    <button onClick={() => setView('contact')} className="text-accent hover:underline">{t('view')}</button>
                </SettingRow>
                 <SettingRow title={t('privacyPolicy')}>
                    <button onClick={() => setView('privacy')} className="text-accent hover:underline">{t('view')}</button>
                </SettingRow>
                 <SettingRow title={t('termsOfService')}>
                    <button onClick={() => setView('terms')} className="text-accent hover:underline">{t('view')}</button>
                </SettingRow>
                 <SettingRow title={t('about')}>
                    <span>{t('version', { version: storeInfo.appVersion })}</span>
                </SettingRow>
                
                 <div className="mt-10 text-center">
                    <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors w-full md:w-auto">
                        {t('logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
