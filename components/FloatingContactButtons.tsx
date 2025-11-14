import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const FloatingContactButtons: React.FC = () => {
    const { storeInfo } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(`Hello, I have a question about ${storeInfo.name}.`)}`;
    const callUrl = `tel:${storeInfo.phone}`;

    return (
        <div className="fixed bottom-5 right-5 z-40" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <div className="relative flex flex-col items-center gap-3">
                {isOpen && (
                    <div className="flex flex-col items-center gap-3 animate-fade-in-fast">
                        {/* Call Button */}
                        <a 
                            href={callUrl}
                            className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-110"
                            aria-label="Call us"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                        </a>

                        {/* WhatsApp Button */}
                        <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-110"
                            aria-label="Contact us on WhatsApp"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
                            </svg>
                        </a>
                    </div>
                )}
                
                {/* Main FAB */}
                 <button
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-accent transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                    aria-label="Contact options"
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
             <style>{`
                @keyframes fadeInFast {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fadeInFast 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default FloatingContactButtons;