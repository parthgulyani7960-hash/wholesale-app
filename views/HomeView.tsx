
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Modal from '../components/Modal';

const HomeView: React.FC<{ products: Product[] }> = ({ products }) => {
    const { setView, storeInfo, viewProduct } = useAppContext();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
    const saleProducts = products.filter(p => p.isListed && p.tags?.includes('On Sale')).slice(0, 4);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const lowercasedQuery = query.toLowerCase();
            const matches = products.filter(p => 
                p.isListed && (
                    p.name.toLowerCase().includes(lowercasedQuery) ||
                    p.description.toLowerCase().includes(lowercasedQuery)
                )
            ).slice(0, 5);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const handleProductClick = (product: Product) => {
        viewProduct(product.id);
        setSearchQuery('');
        setSuggestions([]);
    };

    return (
        <div>
            <div className="h-[calc(80vh)] flex items-center justify-center bg-hero-pattern bg-cover bg-center relative">
                <div className="text-center bg-black/50 p-6 sm:p-10 rounded-lg backdrop-blur-sm select-none cursor-default w-full max-w-3xl mx-4">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-4">
                        Welcome to {storeInfo.name}
                    </h1>
                    <p className="text-lg sm:text-xl text-secondary mb-8 max-w-2xl mx-auto">
                        Your one-stop shop for daily essentials and quality goods.
                    </p>

                    {/* Search Bar */}
                    <div className="relative mb-8 max-w-lg mx-auto text-left">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search for products (e.g., Rice, Soap)..." 
                                className="w-full py-3 pl-12 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-accent/50 shadow-xl transition-shadow"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fade-in-fast">
                                {suggestions.map(product => {
                                    const isOutOfStock = product.stock === 0;
                                    const isLowStock = product.stock > 0 && product.stock <= (product.reorderPoint || 5);
                                    
                                    return (
                                        <div 
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors group"
                                        >
                                            <img src={product.imageUrls[0]} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-200 mr-3" />
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-primary text-sm group-hover:text-accent transition-colors truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{product.description}</p>
                                            </div>
                                            <div className="ml-3 text-right min-w-[80px]">
                                                <div className="font-bold text-primary text-sm">
                                                    {product.discountPrice ? (
                                                        <div className="flex flex-col items-end leading-none">
                                                            <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>
                                                            <span className="text-red-600">₹{product.discountPrice}</span>
                                                        </div>
                                                    ) : (
                                                        <span>₹{product.price}</span>
                                                    )}
                                                </div>
                                                <div className={`text-[10px] font-medium mt-1 ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-600'}`}>
                                                    {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left` : 'In Stock'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setView('products')}
                        className="bg-accent text-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Explore Our Collection
                    </button>
                </div>
            </div>
            
             {saleProducts.length > 0 && (
                <div className="bg-light py-16">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-serif font-bold text-center mb-10 text-primary">Deals Near You</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                            {saleProducts.map(product => (
                                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-primary text-secondary py-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-serif font-bold mb-4 text-white">Experience Convenience on the Go!</h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                        Get the Hind General Store mobile app for exclusive deals and a seamless shopping experience on your Android device.
                    </p>
                    <a
                        href="/HindGeneralStore.apk"
                        download="HindGeneralStore.apk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-accent text-primary font-bold py-4 px-10 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download for Android (.apk)</span>
                    </a>
                    <div className="mt-6 text-sm">
                        <span className="text-gray-400">Version: {storeInfo.appVersion} | For Android 5.0+</span>
                        <button onClick={() => setIsInstallModalOpen(true)} className="text-accent hover:underline ml-4">
                            How to install?
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-secondary py-12">
                <div className="container mx-auto px-6 text-center text-primary">
                    <h2 className="text-2xl font-serif font-bold mb-4">Your Trusted Local Store</h2>
                    <p className="mb-2">{storeInfo.address}</p>
                    <p className="mb-2"><strong>Phone:</strong> {storeInfo.phone}</p>
                    <p><strong>Hours:</strong> {storeInfo.hours}</p>
                </div>
            </div>
            
            <ProductQuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            <Modal
                isOpen={isInstallModalOpen}
                onClose={() => setIsInstallModalOpen(false)}
                title="How to Install APK"
            >
                <div className="space-y-4 text-gray-700 text-sm">
                    <p>To install our app on your Android device, you need to "sideload" the APK file. This is a standard process for installing apps from outside the Google Play Store.</p>
                    <ol className="list-decimal list-inside space-y-3">
                        <li>
                            <strong>Download the APK file:</strong> Tap the "Download for Android" button on our website. Your browser will download the <code className="bg-gray-200 p-1 rounded">HindGeneralStore.apk</code> file.
                        </li>
                        <li>
                            <strong>Allow Installations from Unknown Sources:</strong>
                            <ul className="list-disc list-inside pl-4 mt-2 text-xs">
                                <li>Before you can install it, Android needs your permission. The first time you open a downloaded APK, you'll likely see a security prompt.</li>
                                <li>Tap on <strong>"Settings"</strong> on the prompt.</li>
                                <li>You will be taken to a security screen. Find the option for your browser (e.g., Chrome) and turn on <strong>"Allow from this source"</strong> or <strong>"Install unknown apps"</strong>.</li>
                                <li>This permission is safe and only needs to be granted once for your browser.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Install the App:</strong>
                             <ul className="list-disc list-inside pl-4 mt-2 text-xs">
                                <li>Go back to your browser's downloads, or find the <code className="bg-gray-200 p-1 rounded">HindGeneralStore.apk</code> file in your "Files" or "My Files" app.</li>
                                <li>Tap on the file again. This time, the installation screen should appear.</li>
                                <li>Tap <strong>"Install"</strong> and wait for the process to complete.</li>
                            </ul>
                        </li>
                        <li><strong>Open the App:</strong> Once installed, you can find the Hind General Store app on your home screen or in your app drawer.</li>
                    </ol>
                    <div className="text-xs text-yellow-700 bg-yellow-100 p-3 rounded-lg mt-4">
                        <p><strong>Security Note:</strong> Your device's security is important. Only download our APK from our official website to ensure you get a safe and genuine version. The "Unknown Sources" warning is a standard Android security feature.</p>
                    </div>
                </div>
            </Modal>
            <style>{`
                @keyframes fadeInFast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fadeInFast 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default HomeView;
