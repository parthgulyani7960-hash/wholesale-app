import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PaymentDetailsConfig } from '../../types';

const AdminPaymentSettings: React.FC = () => {
    const { paymentDetails, updatePaymentDetails } = useAppContext();
    const [details, setDetails] = useState<PaymentDetailsConfig>(paymentDetails);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };
    
    const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDetails(prev => ({...prev, qrCodeImage: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updatePaymentDetails(details);
        setIsSaving(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Manual Payment Settings</h2>
            <p className="text-sm text-gray-600 mb-6">These details will be shown to customers when they select the "Manual Transfer" payment option at checkout.</p>
            
            <div className="space-y-4 max-w-2xl">
                <div>
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <input type="text" id="upiId" name="upiId" value={details.upiId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                </div>
                <div>
                    <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                    <input type="text" id="accountHolderName" name="accountHolderName" value={details.accountHolderName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                </div>
                 <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                    <input type="text" id="accountNumber" name="accountNumber" value={details.accountNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                </div>
                <div>
                    <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">IFSC Code</label>
                    <input type="text" id="ifscCode" name="ifscCode" value={details.ifscCode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" />
                </div>
                <div className="flex items-end gap-4">
                    <div className="flex-grow">
                         <label htmlFor="qrCodeImage" className="block text-sm font-medium text-gray-700">Upload QR Code Image</label>
                        <input type="file" id="qrCodeImage" name="qrCodeImage" accept="image/*" onChange={handleQrCodeUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" />
                    </div>
                     {details.qrCodeImage && <img src={details.qrCodeImage} alt="QR Code Preview" className="w-24 h-24 border rounded-md" />}
                </div>
            </div>

            <div className="mt-6 text-right">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : 'Save Payment Details'}
                </button>
            </div>
        </div>
    );
};

export default AdminPaymentSettings;