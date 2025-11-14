import React from 'react';
import { useAppContext } from '../context/AppContext';

const PrivacyPolicyView: React.FC = () => {
    const { storeInfo, setView } = useAppContext();
    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-serif font-bold text-center mb-6 text-primary">Privacy Policy</h1>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    
                    <h3>Introduction</h3>
                    <p>
                        Welcome to {storeInfo.name}. We are committed to protecting your privacy and handling your personal data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application (the "Service"). Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect via the Application includes:
                    </p>
                    <ul>
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Application or when you choose to participate in various activities related to the Application, such as online chat and message boards.</li>
                        <li><strong>Financial Data:</strong> While we offer manual payment methods and do not directly process payments, we may collect proof of payment, such as screenshots, which may contain financial information. This data is used solely for order verification and is handled securely.</li>
                         <li><strong>Device and Usage Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
                    </p>
                    <ul>
                        <li>Create and manage your account.</li>
                        <li>Process your orders and manage payments, including payment verification.</li>
                        <li>Deliver products and services you have requested.</li>
                        <li>Communicate with you regarding your account or orders.</li>
                        <li>Request feedback and contact you about your use of the Application.</li>
                        <li>Resolve disputes and troubleshoot problems.</li>
                        <li>Send you promotional materials, with your consent.</li>
                    </ul>

                    <h3>3. Disclosure of Your Information</h3>
                    <p>
                        We do not sell, trade, or rent your personal information to others. We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                    </p>
                     <ul>
                        <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                        <li><strong>Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (for verification), data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                    </ul>
                    
                     <h3>4. Security of Your Information</h3>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties.
                    </p>

                    <h3>5. Policy for Children</h3>
                    <p>
                        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                    </p>

                    <h3>6. Your Rights</h3>
                     <p>You have the right to access, correct, or delete your personal data. You can manage most of your information through the "My Account" page. For any requests you cannot fulfill yourself, please contact our support team.</p>

                    <h3>7. Contact Us</h3>
                    <p>
                        If you have any questions or concerns about this Privacy Policy, please contact us through the <button onClick={() => setView('contact')} className="text-accent hover:underline">Contact Page</button> in our app.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;