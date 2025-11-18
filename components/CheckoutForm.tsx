
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

    const finalTotal = Math.max(0, cartTotal - firstOrderDiscount - couponDiscount + deliveryFeeToApply);

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
            // Double check balance just in case
            if ((currentUser.walletBalance || 0) < finalTotal) {
                showNotification("Insufficient wallet balance.");
                setIsProcessing(false);
                return;
            }
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <StepIndicator />
            {step === 1 && (
                 <div className="animate-fade-in-fast space-y-4">
                    <h3 className="font-serif font-bold text-xl text-primary">{t('yourDetails')}</h3>
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
                <div className="animate-fade-in-fast space-y-6">
                     <h3 className="font-serif font-bold text-xl text-primary">{t('deliveryAndPayment')}</h3>
                     
                    {/* Delivery Method Section */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Method</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`relative flex items-center p-4 cursor-pointer rounded-lg border transition-all ${deliveryMethod === 'Home Delivery' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="deliveryMethod" value="Home Delivery" checked={deliveryMethod === 'Home Delivery'} onChange={() => setDeliveryMethod('Home Delivery')} className="sr-only" />
                                <span className={`flex-1 text-sm font-medium ${deliveryMethod === 'Home Delivery' ? 'text-primary' : 'text-gray-900'}`}>Home Delivery</span>
                                {deliveryMethod === 'Home Delivery' && <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                            </label>
                            <label className={`relative flex items-center p-4 cursor-pointer rounded-lg border transition-all ${deliveryMethod === 'In-Store Pickup' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="deliveryMethod" value="In-Store Pickup" checked={deliveryMethod === 'In-Store Pickup'} onChange={() => setDeliveryMethod('In-Store Pickup')} className="sr-only" />
                                <span className={`flex-1 text-sm font-medium ${deliveryMethod === 'In-Store Pickup' ? 'text-primary' : 'text-gray-900'}`}>In-Store Pickup</span>
                                {deliveryMethod === 'In-Store Pickup' && <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                            </label>
                        </div>
                    </div>
                    
                    {deliveryMethod === 'Home Delivery' && (
                         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Delivery Slot</label>
                            <DeliveryScheduler onSelectSlot={setDeliverySlot} />
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
                        <div className="space-y-3">
                            {/* Pay from Wallet Option */}
                            {currentUser && currentUser.hasWallet && (currentUser.walletBalance || 0) >= finalTotal && (
                                <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${paymentMethod === 'Pay from Wallet' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center h-5">
                                        <input type="radio" name="paymentMethod" value="Pay from Wallet" checked={paymentMethod === 'Pay from Wallet'} onChange={() => setPaymentMethod('Pay from Wallet')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <span className="block font-medium text-gray-900">Pay from Wallet</span>
                                        <span className="block text-gray-500">Available Balance: <span className="font-semibold text-green-600">₹{(currentUser.walletBalance || 0).toFixed(2)}</span></span>
                                    </div>
                                </label>
                            )}
                            
                             {/* Manual Transfer Option */}
                            <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${paymentMethod === 'Manual Transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center h-5">
                                    <input type="radio" name="paymentMethod" value="Manual Transfer" checked={paymentMethod === 'Manual Transfer'} onChange={() => setPaymentMethod('Manual Transfer')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <span className="block font-medium text-gray-900">Manual Transfer (UPI/Bank)</span>
                                    <span className="block text-gray-500">Pay via UPI or Bank Transfer and upload screenshot</span>
                                </div>
                            </label>
                            
                            {/* COD Option */}
                            <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center h-5">
                                    <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <span className="block font-medium text-gray-900">Cash on Delivery</span>
                                    <span className="block text-gray-500">Pay when you receive your order</span>
                                </div>
                            </label>

                            {/* Khata Option */}
                            {currentUser?.hasCredit && (
                                <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${paymentMethod === 'Pay on Khata' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center h-5">
                                        <input type="radio" name="paymentMethod" value="Pay on Khata" checked={paymentMethod === 'Pay on Khata'} onChange={() => setPaymentMethod('Pay on Khata')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <span className="block font-medium text-gray-900">Pay on Khata (Credit)</span>
                                        <span className="block text-gray-500">Add to your store credit account</span>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    {paymentMethod === 'Manual Transfer' && (
                        <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg space-y-4 text-sm">
                            <h4 className="font-bold text-primary text-base">Payment Instructions</h4>
                            <p>Please transfer <strong>₹{finalTotal.toFixed(2)}</strong> to the details below and upload a screenshot.</p>
                            <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-4 rounded-lg border border-blue-100">
                                <div className="space-y-2 flex-grow">
                                    <p><strong className="text-gray-700">UPI ID:</strong> <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{paymentDetails.upiId}</span></p>
                                    <p><strong className="text-gray-700">Account Name:</strong> {paymentDetails.accountHolderName}</p>
                                    <p><strong className="text-gray-700">Account Number:</strong> <span className="font-mono">{paymentDetails.accountNumber}</span></p>
                                    <p><strong className="text-gray-700">IFSC Code:</strong> <span className="font-mono">{paymentDetails.ifscCode}</span></p>
                                </div>
                                {paymentDetails.qrCodeImage && <img src={paymentDetails.qrCodeImage} alt="UPI QR Code" className="w-32 h-32 border rounded-md shadow-sm" />}
                            </div>
                            <div>
                                <label htmlFor="screenshot" className="block text-sm font-bold text-gray-700 mb-2">Upload Screenshot</label>
                                <input type="file" id="screenshot" name="screenshot" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer" required />
                                {paymentScreenshot && <img src={paymentScreenshot} alt="Preview" className="mt-3 max-h-40 rounded-lg shadow-md border" />}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {step === 3 && (
                <div className="animate-fade-in-fast space-y-4">
                    <h3 className="font-serif font-bold text-xl text-primary">{t('confirmYourOrder')}</h3>
                     <div>
                        <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700">Order Notes (Optional)</label>
                        <textarea id="customerNotes" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent" placeholder="e.g., Call before delivery, pack vegetables separately..."></textarea>
                    </div>
                     <div className="bg-gray-50 p-5 rounded-lg border text-sm space-y-3">
                        <h4 className="font-bold text-base border-b pb-2 mb-2 text-gray-800">Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             <div><strong>Name:</strong> {userDetails.name}</div>
                             <div><strong>Address:</strong> {userDetails.address}, {userDetails.pincode}</div>
                             <div><strong>Delivery:</strong> {deliveryMethod} {deliveryMethod === 'Home Delivery' && `(${deliverySlot})`}</div>
                             <div><strong>Payment:</strong> {paymentMethod}</div>
                        </div>
                        
                        <div className="border-t pt-3 mt-3 space-y-2">
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
                            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-1 text-primary"><span>Grand Total:</span> <span>₹{finalTotal.toFixed(2)}</span></div>
                        </div>
                        
                        {!appliedCoupon && availableCoupons.length > 0 && (
                            <div className="pt-3 border-t mt-3">
                                <label className="block text-xs font-medium text-gray-700 mb-2">{t('availableCoupons')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableCoupons.map(coupon => (
                                        <button type="button" key={coupon.code} onClick={() => handleApplyCoupon(coupon)} className="text-xs bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded-md border border-green-200 hover:bg-green-200 transition-colors">
                                            {coupon.code}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                         <div className="pt-2">
                            <label htmlFor="coupon" className="block text-xs font-medium text-gray-700">{t('haveACoupon')}</label>
                            <div className="flex gap-2 mt-1">
                                <input type="text" id="coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter code" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-accent" />
                                <button type="button" onClick={handleManualCouponApply} className="bg-secondary text-primary font-semibold px-4 py-2 text-xs rounded-md border border-gray-300 hover:bg-gray-200 transition-colors">{t('apply')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-4 border-t">
                {step > 1 && <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium">{t('back')}</button>}
                {step < 3 && <button type="button" onClick={nextStep} className="bg-primary text-white px-8 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors ml-auto font-medium">{t('next')}</button>}
                {step === 3 && <button type="submit" className="bg-primary text-white px-8 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400 font-bold shadow-md" disabled={isProcessing}>
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
