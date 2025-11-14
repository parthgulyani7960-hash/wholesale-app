import React from 'react';
import { useAppContext } from '../context/AppContext';

const TermsOfServiceView: React.FC = () => {
    const { storeInfo, setView } = useAppContext();
    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-serif font-bold text-center mb-6 text-primary">Terms of Service</h1>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                     <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    <p>
                        Please read these Terms of Service ("Terms") carefully before using the {storeInfo.name} application (the "Service") operated by us. Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.
                    </p>

                    <h3>1. Accounts</h3>
                    <p>
                        When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service. You are responsible for maintaining the confidentiality of your account and password, and you agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
                    </p>

                    <h3>2. Orders, Pricing, and Payments</h3>
                    <p>
                        By placing an order, you are offering to purchase a product on and subject to the following terms and conditions. All orders are subject to availability and confirmation of the order price.
                    </p>
                    <p>
                        Whilst we try and ensure that all details, descriptions, and prices which appear on this Application are accurate, errors may occur. If we discover an error in the price of any goods which you have ordered we will inform you of this as soon as possible.
                    </p>
                    <p>
                        For manual payments, you agree to provide accurate proof of payment for verification. We reserve the right to refuse or cancel any order at our sole discretion, including but not limited to orders that appear to be fraudulent or in breach of these Terms.
                    </p>
                    
                    <h3>3. Prohibited Activities</h3>
                    <p>You may not access or use the Service for any purpose other than that for which we make the Service available. As a user of the Service, you agree not to:</p>
                    <ul>
                        <li>Systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                        <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
                        <li>Interfere with, disrupt, or create an undue burden on the Service or the networks or services connected to the Service.</li>
                         <li>Attempt to impersonate another user or person or use the username of another user.</li>
                    </ul>

                    <h3>4. Intellectual Property</h3>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of {storeInfo.name} and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries. Our trademarks may not be used in connection with any product or service without the prior written consent of {storeInfo.name}.
                    </p>
                    
                     <h3>5. Limitation of Liability</h3>
                    <p>
                        In no event shall {storeInfo.name}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                    </p>

                     <h3>6. Changes to Terms</h3>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>

                    <h3>7. Contact Us</h3>
                    <p>
                       If you have any questions about these Terms, please contact us through the <button onClick={() => setView('contact')} className="text-accent hover:underline">Contact Page</button>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServiceView;