
import React, { useState } from 'react';
import { StoreInfoConfig } from '../../types';
import { useAppContext } from '../../context/AppContext';

const AdminStoreSettings: React.FC = () => {
    const { storeInfo, updateStoreInfo, serviceablePincodes, updateServiceablePincodes, showNotification, broadcastNotification } = useAppContext();
    const [formState, setFormState] = useState<StoreInfoConfig>(storeInfo);
    const [pincodes, setPincodes] = useState(serviceablePincodes.join(', '));
    const [isSaving, setIsSaving] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormState({ ...formState, [name]: parseFloat(value) || 0 });
        } else {
            setFormState({ ...formState, [name]: value });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const pincodeArray = pincodes.split(',').map(p => p.trim()).filter(p => p);
        await Promise.all([
            updateStoreInfo(formState),
            updateServiceablePincodes(pincodeArray)
        ]);
        setIsSaving(false);
    };
    
    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) {
            showNotification('Broadcast message cannot be empty.');
            return;
        }
        setIsBroadcasting(true);
        await broadcastNotification(broadcastMessage);
        setIsBroadcasting(false);
        setBroadcastMessage('');
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Store Information & Settings</h2>
            <div className="space-y-6 max-w-3xl">
                {/* General Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-gray-200 pb-2">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Store Name</label>
                            <input type="text" id="name" name="name" value={formState.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Store Phone</label>
                            <input type="text" id="phone" name="phone" value={formState.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                            <input type="text" id="whatsapp" name="whatsapp" value={formState.whatsapp} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                         <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700">Operating Hours</label>
                            <input type="text" id="hours" name="hours" value={formState.hours} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div>
                            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">GST Number</label>
                            <input type="text" id="gstNumber" name="gstNumber" value={formState.gstNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="googleMapsLink" className="block text-sm font-medium text-gray-700">Google Maps Link</label>
                            <input type="text" id="googleMapsLink" name="googleMapsLink" value={formState.googleMapsLink} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="aboutUs" className="block text-sm font-medium text-gray-700">About Us Section</label>
                            <textarea
                                id="aboutUs"
                                name="aboutUs"
                                value={formState.aboutUs}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping Configuration Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-gray-200 pb-2">Shipping Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shipping Scope</label>
                            <div className="mt-2 flex space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="shippingScope" value="local" checked={formState.shippingScope === 'local'} onChange={handleChange} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" />
                                    <span className="ml-2 text-sm text-gray-700">Local (Pincode-based)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="shippingScope" value="nationwide" checked={formState.shippingScope === 'nationwide'} onChange={handleChange} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" />
                                    <span className="ml-2 text-sm text-gray-700">Nationwide</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700">Local Delivery Fee (₹)</label>
                                <input type="number" id="deliveryFee" name="deliveryFee" value={formState.deliveryFee || 0} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                                 <p className="text-xs text-gray-500 mt-1">Applied when Shipping Scope is 'Local'.</p>
                            </div>
                            <div>
                                <label htmlFor="nationwideShippingFee" className="block text-sm font-medium text-gray-700">Nationwide Shipping Fee (₹)</label>
                                <input type="number" id="nationwideShippingFee" name="nationwideShippingFee" value={formState.nationwideShippingFee || 0} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                                <p className="text-xs text-gray-500 mt-1">Applied when Shipping Scope is 'Nationwide'.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="freeDeliveryThreshold" className="block text-sm font-medium text-gray-700">Free Delivery Threshold (₹)</label>
                                <input type="number" id="freeDeliveryThreshold" name="freeDeliveryThreshold" value={formState.freeDeliveryThreshold || 0} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                                <p className="text-xs text-gray-500 mt-1">Orders above this amount qualify for free shipping.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="serviceablePincodes" className="block text-sm font-medium text-gray-700">Serviceable Pincodes (Local Scope)</label>
                                <input type="text" id="serviceablePincodes" name="serviceablePincodes" value={pincodes} onChange={e => setPincodes(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" placeholder="e.g., 45678, 45679, 45680" />
                                <p className="text-xs text-gray-500 mt-1">Enter valid pincodes separated by commas.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-gray-200 pb-2">Appearance</h3>
                    <div>
                        <label htmlFor="backgroundImageUrl" className="block text-sm font-medium text-gray-700">Background Image URL</label>
                        <input type="text" id="backgroundImageUrl" name="backgroundImageUrl" value={formState.backgroundImageUrl || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" placeholder="e.g., https://example.com/pattern.png" />
                        <p className="text-xs text-gray-500 mt-1">Enter a URL for a subtle, calming background image. Leave blank for default background.</p>
                    </div>
                </div>
            </div>

             <div className="mt-6 text-right">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="mt-8 pt-6 border-t max-w-3xl">
                <h2 className="text-xl font-serif font-bold text-primary mb-2">Broadcast Notification</h2>
                <p className="text-sm text-gray-600 mb-4">Send a notification to all registered customers. This will appear in their notifications panel inside the app.</p>
                <div>
                    <label htmlFor="broadcastMessage" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        id="broadcastMessage"
                        name="broadcastMessage"
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent"
                        placeholder="E.g., Special Diwali sale starting tomorrow! Get 20% off on all items."
                    />
                </div>
                <div className="mt-4 text-right">
                    <button
                        onClick={handleBroadcast}
                        disabled={isBroadcasting || !broadcastMessage.trim()}
                        className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400"
                    >
                        {isBroadcasting ? 'Sending...' : 'Send Broadcast'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminStoreSettings;
