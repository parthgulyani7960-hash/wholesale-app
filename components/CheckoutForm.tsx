

import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserDetails, Order, PaymentMethod, DeliveryMethod, Coupon } from '../types';
import DeliveryScheduler from './DeliveryScheduler';
import { useTranslation } from 'react-i18next';

interface CheckoutFormProps {
    onCheckoutSuccess: () => void;
    isFirstOrder: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCheckoutSuccess, isFirstOrder }) => {
    const { cartItems, cartTotal, clearCart, addOrder, showNotification, paymentDetails, serviceablePincodes, storeInfo, coupons, updateUser, currentUser } = useAppContext();
    const { t } = useTranslation();
    
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails>({
        name: '', email: '', mobile: '', shopName: '', address: '', pincode: '',
    });
    const [pincodeStatus, setPincodeStatus] = useState<'unchecked' | 'valid' | 'invalid'>('unchecked');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Manual Transfer');
    const [paymentScreenshot, setPaymentScreenshot] = useState<string | undefined>(undefined);
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Home Delivery');
    const [deliverySlot, setDeliverySlot] = useState<string | undefined>(undefined);
    const [customerNotes, setCustomerNotes] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    const availableCoupons = useMemo(() => {
        return coupons.filter(c => 
            c.isActive && 
            (!c.userId || c.userId === currentUser?.id)
        );
    }, [coupons, currentUser]);

    const firstOrderDiscount = isFirstOrder && cartTotal > 0 ? 50 : 0;

    const couponDiscount = useMemo(() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'fixed') {
            return appliedCoupon.value;
        }
        if (appliedCoupon.type === 'percentage') {
            return cartTotal * (appliedCoupon.value / 100);
        }
        return 0;
    }, [appliedCoupon, cartTotal]);

    const deliveryFeeToApply = useMemo(() => {
        if (deliveryMethod !== 'Home Delivery') {
            return 0; // No fee for in-store pickup
        }
        if (cartTotal >= storeInfo.freeDeliveryThreshold) {
            return 0; // Qualifies for free delivery
        }
        return storeInfo.shippingScope === 'nationwide' ? storeInfo.nationwideShippingFee : storeInfo.deliveryFee;
    }, [cartTotal, storeInfo, deliveryMethod]);

    const finalTotal = cartTotal - firstOrderDiscount - couponDiscount + deliveryFeeToApply;

    useEffect(() => {
        if (currentUser) {
            setUserDetails(prev => ({
                ...prev,
                name: currentUser.name || '',
                email: currentUser.email || '',
                mobile: currentUser.mobile || '',
                shopName: currentUser.shopName || '',
                address: currentUser.address || '',
                pincode: currentUser.pincode || '',
            }));
             if (currentUser.pincode) {
                const isServiceable = serviceablePincodes.includes(currentUser.pincode);
                setPincodeStatus(isServiceable ? 'valid' : 'invalid');
            }
        }
    }, [currentUser, serviceablePincodes]);

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserDetails(prev => ({ ...prev, [name]: value }));

        if (name === 'pincode') {
            if (value.trim().length >= 5) {
                const trimmedPincode = value.trim();
                let isServiceable = false;
                if (storeInfo.shippingScope === 'nationwide') {
                    isServiceable = /^\d{6}$/.test(trimmedPincode);
                } else {
                    isServiceable = serviceablePincodes.includes(trimmedPincode);
                }
                setPincodeStatus(isServiceable ? 'valid' : 'invalid');
            } else {
                setPincodeStatus('unchecked');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPaymentScreenshot(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleApplyCoupon = (couponToApply: Coupon) => {
        if (couponToApply.minOrderValue && cartTotal < couponToApply.minOrderValue) {
            showNotification(`Coupon requires a minimum order value of ₹${couponToApply.minOrderValue}.`);
            return;
        }
        setAppliedCoupon(couponToApply);
        setCouponCode(couponToApply.code);
        showNotification(`Coupon "${couponToApply.code}" applied!`);
    };
    
    const handleManualCouponApply = () => {
        const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive && (!c.userId || c.userId === currentUser?.id));
        if (coupon) {
            handleApplyCoupon(coupon);
        } else {
            showNotification('Invalid or expired coupon code.');
        }
    };

    const validateStep1 = () => {
        if (!userDetails.name.trim() || !userDetails.email.trim() || !userDetails.mobile.trim() || !userDetails.address.trim() || !userDetails.pincode.trim()) {
            showNotification('Please fill out all your details, including pincode.');
            return false;
        }
        if (userDetails.address.trim().length < 10) {
            showNotification('Please enter a valid delivery address (at least 10 characters).');
            return false;
        }
        
        const trimmedPincode = userDetails.pincode.trim();
        let isPincodeValid = false;

        if (storeInfo.shippingScope === 'nationwide') {
            isPincodeValid = /^\d{6}$/.test(trimmedPincode);
        } else {
            isPincodeValid = serviceablePincodes.includes(trimmedPincode);
        }
        
        if (!isPincodeValid) {
            setPincodeStatus('invalid');
            const message = storeInfo.shippingScope === 'nationwide'
                ? 'Please enter a valid 6-digit pincode.'
                : 'Sorry, we do not deliver to your pincode.';
            showNotification(message);
            return false;
        }
        
        setPincodeStatus('valid');
        return true;
    };

    const validateStep2 = () => {
        if (deliveryMethod === 'Home Delivery' && !deliverySlot) {
            showNotification('Please select a delivery slot.');
            return false;
        }
        if (paymentMethod === 'Manual Transfer' && !paymentScreenshot) {
            showNotification('Please upload a payment screenshot for manual transfer.');
            return false;
        }
        return true;
    };
    
    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        
        if (paymentMethod === 'Pay from Wallet' && currentUser) {
            const newBalance = (currentUser.walletBalance || 0) - finalTotal;
            await updateUser({ id: currentUser.id, walletBalance: newBalance });
        }

        const newOrderData: Omit<Order, 'id' | 'date' | 'status'> = {
            user: userDetails,
            items: cartItems,
            total: finalTotal,
            paymentMethod,
            paymentScreenshot: paymentMethod === 'Manual Transfer' ? paymentScreenshot : undefined,
            deliveryMethod,
            deliverySlot: deliveryMethod === 'Home Delivery' ? deliverySlot : undefined,
            discountApplied: firstOrderDiscount + couponDiscount > 0 ? firstOrderDiscount + couponDiscount : undefined,
            couponApplied: appliedCoupon?.code,
            customerNotes: customerNotes.trim() || undefined,
            deliveryFeeApplied: deliveryFeeToApply > 0 ? deliveryFeeToApply : undefined,
        };
        await addOrder(newOrderData);
        clearCart();
        setIsProcessing(false);
        onCheckoutSuccess();
    };

    const StepIndicator = () => (
        <div className="flex justify-center items-center mb-6">
            {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {s}
                    </div>
                    {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <StepIndicator />
            {step === 1 && (
                 <div className="animate-fade-in-fast space-y-4">
                    <h3 className="font-semibold text-lg">{t('yourDetails')}</h3>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" id="name" name="name" value={userDetails.name} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={userDetails.email} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                        <input type="tel" id="mobile" name="mobile" value={userDetails.mobile} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name (Optional)</label>
                        <input type="text" id="shopName" name="shopName" value={userDetails.shopName} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea id="address" name="address" value={userDetails.address} onChange={handleUserChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required></textarea>
                    </div>
                     <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                        <input type="text" id="pincode" name="pincode" value={userDetails.pincode} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required maxLength={6} />
                        {pincodeStatus === 'valid' && (
                            <p className="text-sm text-green-600 mt-1">Great! We deliver to your area.</p>
                        )}
                        {pincodeStatus === 'invalid' && (
                            <p className="text-sm text-red-600 mt-1">
                                {storeInfo.shippingScope === 'nationwide'
                                ? 'Please enter a valid 6-digit pincode.'
                                : 'Sorry, we do not deliver to this pincode yet.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="animate-fade-in-fast space-y-4">
                     <h3 className="font-semibold text-lg">{t('deliveryAndPayment')}</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Method</label>
                         <div className="mt-2 flex space-x-4">
                            <label className="flex items-center"><input type="radio" name="deliveryMethod" value="Home Delivery" checked={deliveryMethod === 'Home Delivery'} onChange={() => setDeliveryMethod('Home Delivery')} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" /><span className="ml-2 text-sm text-gray-600">Home Delivery</span></label>
                            <label className="flex items-center"><input type="radio" name="deliveryMethod" value="In-Store Pickup" checked={deliveryMethod === 'In-Store Pickup'} onChange={() => setDeliveryMethod('In-Store Pickup')} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" /><span className="ml-2 text-sm text-gray-600">In-Store Pickup</span></label>
                        </div>
                    </div>
                    {deliveryMethod === 'Home Delivery' && <div className="p-4 bg-gray-50 rounded-lg border"><label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Slot</label><DeliveryScheduler onSelectSlot={setDeliverySlot} /></div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="mt-1 space-y-2">
                            {currentUser && currentUser.walletBalance && currentUser.walletBalance >= finalTotal && (
                                <label className={`p-3 border rounded-md flex items-center cursor-pointer transition-all duration-200 ${paymentMethod === 'Pay from Wallet' ? 'bg-accent/10 border-accent shadow-sm' : 'border-gray-300 hover:border-accent/50'}`}>
                                    <input type="radio" name="paymentMethod" value="Pay from Wallet" checked={paymentMethod === 'Pay from Wallet'} onChange={() => setPaymentMethod('Pay from Wallet')} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" />
                                    <span className="ml-3 text-sm font-medium text-gray-800">Pay from Wallet (Balance: ₹{currentUser.walletBalance.toFixed(2)})</span>
                                </label>
                            )}
                            <label className={`p-3 border rounded-md flex items-center cursor-pointer transition-all duration-200 ${paymentMethod === 'Manual Transfer' ? 'bg-accent/10 border-accent shadow-sm' : 'border-gray-300 hover:border-accent/50'}`}><input type="radio" name="paymentMethod" value="Manual Transfer" checked={paymentMethod === 'Manual Transfer'} onChange={() => setPaymentMethod('Manual Transfer')} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" /><span className="ml-3 text-sm font-medium text-gray-800">Manual Transfer (UPI/Bank)</span></label>
                            <label className={`p-3 border rounded-md flex items-center cursor-pointer transition-all duration-200 ${paymentMethod === 'Cash on Delivery' ? 'bg-accent/10 border-accent shadow-sm' : 'border-gray-300 hover:border-accent/50'}`}><input type="radio" name="paymentMethod" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" /><span className="ml-3 text-sm font-medium text-gray-800">Cash on Delivery</span></label>
                            {currentUser?.hasCredit && <label className={`p-3 border rounded-md flex items-center cursor-pointer transition-all duration-200 ${paymentMethod === 'Pay on Khata' ? 'bg-accent/10 border-accent shadow-sm' : 'border-gray-300 hover:border-accent/50'}`}><input type="radio" name="paymentMethod" value="Pay on Khata" checked={paymentMethod === 'Pay on Khata'} onChange={() => setPaymentMethod('Pay on Khata')} className="focus:ring-accent h-4 w-4 text-accent border-gray-300" /><span className="ml-3 text-sm font-medium text-gray-800">Pay on Khata (Credit)</span></label>}
                        </div>
                    </div>
                    {paymentMethod === 'Manual Transfer' && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 text-sm">
                            <h4 className="font-bold text-primary">Payment Instructions</h4>
                            <p>Please transfer <strong>₹{finalTotal.toFixed(2)}</strong> to the details below and upload a screenshot.</p>
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="space-y-1 flex-grow">
                                    <p><strong>UPI ID:</strong> {paymentDetails.upiId}</p>
                                    <p><strong>Account Name:</strong> {paymentDetails.accountHolderName}</p>
                                    <p><strong>Account Number:</strong> {paymentDetails.accountNumber}</p>
                                    <p><strong>IFSC Code:</strong> {paymentDetails.ifscCode}</p>
                                </div>
                                {paymentDetails.qrCodeImage && <img src={paymentDetails.qrCodeImage} alt="UPI QR Code" className="w-24 h-24 border rounded-md" />}
                            </div>
                            <div>
                                <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">Upload Screenshot</label>
                                <input type="file" id="screenshot" name="screenshot" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" required />
                                {paymentScreenshot && <img src={paymentScreenshot} alt="Preview" className="mt-2 max-h-32 rounded" />}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {step === 3 && (
                <div className="animate-fade-in-fast space-y-4">
                    <h3 className="font-semibold text-lg">{t('confirmYourOrder')}</h3>
                     <div>
                        <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700">Order Notes (Optional)</label>
                        <textarea id="customerNotes" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" placeholder="e.g., Call before delivery, pack vegetables separately..."></textarea>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
                        <h4 className="font-semibold text-base mb-2">Summary</h4>
                        <div><strong>Name:</strong> {userDetails.name}</div>
                        <div><strong>Address:</strong> {userDetails.address}, {userDetails.pincode}</div>
                        <div><strong>Delivery:</strong> {deliveryMethod} {deliveryMethod === 'Home Delivery' && `(${deliverySlot})`}</div>
                        <div><strong>Payment:</strong> {paymentMethod}</div>
                        <div className="border-t pt-2 mt-2 space-y-1">
                            <div className="flex justify-between"><span>Subtotal:</span> <span>₹{cartTotal.toFixed(2)}</span></div>
                            {isFirstOrder && <div className="flex justify-between text-green-600"><span>First Order Discount:</span> <span>- ₹{firstOrderDiscount.toFixed(2)}</span></div>}
                             {appliedCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon ({appliedCoupon.code}):</span>
                                    <span>- ₹{couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span>{deliveryFeeToApply > 0 ? `₹${deliveryFeeToApply.toFixed(2)}` : 'Free'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t pt-1 mt-1"><span>Grand Total:</span> <span>₹{finalTotal.toFixed(2)}</span></div>
                        </div>
                        
                        {!appliedCoupon && availableCoupons.length > 0 && (
                            <div className="pt-3 border-t mt-3">
                                <label className="block text-xs font-medium text-gray-700 mb-2">{t('availableCoupons')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableCoupons.map(coupon => (
                                        <button type="button" key={coupon.code} onClick={() => handleApplyCoupon(coupon)} className="text-xs bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded-md border border-green-200 hover:bg-green-200">
                                            {coupon.code}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                         <div className="pt-2">
                            <label htmlFor="coupon" className="block text-xs font-medium text-gray-700">{t('haveACoupon')}</label>
                            <div className="flex gap-2 mt-1">
                                <input type="text" id="coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter code" className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                                <button type="button" onClick={handleManualCouponApply} className="bg-secondary text-primary font-semibold px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-200">{t('apply')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-4">
                {step > 1 && <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">{t('back')}</button>}
                {step < 3 && <button type="button" onClick={nextStep} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors ml-auto">{t('next')}</button>}
                {step === 3 && <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400" disabled={isProcessing}>
                    {isProcessing ? t('processing') : t('placeOrder')}
                </button>}
            </div>
            <style>{`
                @keyframes fadeInFast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fadeInFast 0.3s ease-out forwards;
                }
            `}</style>
        </form>
    );
};

export default CheckoutForm;
