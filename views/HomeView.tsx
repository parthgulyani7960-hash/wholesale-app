import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Modal from '../components/Modal';

const HomeView: React.FC<{ products: Product[] }> = ({ products }) => {
    const { setView, storeInfo } = useAppContext();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
    const saleProducts = products.filter(p => p.isListed && p.tags?.includes('On Sale')).slice(0, 4);

    return (
        <div>
            <div className="h-[calc(80vh)] flex items-center justify-center bg-hero-pattern bg-cover bg-center">
                <div className="text-center bg-black/50 p-6 sm:p-10 rounded-lg backdrop-blur-sm select-none cursor-default">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-4">
                        Welcome to {storeInfo.name}
                    </h1>
                    <p className="text-lg sm:text-xl text-secondary mb-8 max-w-2xl">
                        Your one-stop shop for daily essentials and quality goods.
                    </p>
                    <button
                        onClick={() => setView('products')}
                        className="bg-accent text-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
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
        </div>
    );
};

export default HomeView;