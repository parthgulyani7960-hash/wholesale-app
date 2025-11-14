import React from 'react';
import { useAppContext } from '../context/AppContext';

const ContactView: React.FC = () => {
    const { storeInfo } = useAppContext();
    
    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-center mb-4 text-primary">Contact Us</h1>
            <p className="text-center text-gray-600 mb-12">We're here to help. Reach out to us through any of the methods below.</p>
            
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-2">Our Store</h2>
                        <p className="text-gray-700">{storeInfo.address}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-primary">Phone</h3>
                        <a href={`tel:${storeInfo.phone}`} className="text-accent hover:underline">{storeInfo.phone}</a>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-primary">Operating Hours</h3>
                        <p className="text-gray-700">{storeInfo.hours}</p>
                    </div>
                    <div>
                        <a 
                            href={storeInfo.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-primary text-white font-bold py-2 px-5 rounded-md hover:bg-accent hover:text-primary transition-colors"
                        >
                            Get Directions
                        </a>
                    </div>
                </div>
                <div>
                     <img 
                        src="https://picsum.photos/seed/map/800/600" 
                        alt="Map showing store location" 
                        className="rounded-lg object-cover w-full h-full min-h-[250px]"
                    />
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ContactView;