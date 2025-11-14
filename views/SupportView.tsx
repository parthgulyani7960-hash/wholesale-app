
import React, { useState } from 'react';
import { SupportTicket, SupportMessage } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';

interface SupportViewProps {
    tickets: SupportTicket[];
}

const SupportView: React.FC<SupportViewProps> = ({ tickets }) => {
    const { addTicket, addTicketMessage, currentUser } = useAppContext();
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [replyMessage, setReplyMessage] = useState('');

    const handleCreateTicket = async () => {
        if (!newSubject.trim() || !newMessage.trim() || !currentUser) return;
        setIsSubmitting(true);
        const initialMessage: SupportMessage = {
            author: 'user',
            text: newMessage,
            date: new Date(),
        };
        await addTicket({
            userId: currentUser.id,
            userName: currentUser.name,
            subject: newSubject,
            messages: [initialMessage],
        });
        setIsSubmitting(false);
        setIsCreateModalOpen(false);
        setNewSubject('');
        setNewMessage('');
    };
    
    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedTicket || !currentUser) return;
        setIsSubmitting(true);
        const message: SupportMessage = {
            author: 'user',
            text: replyMessage,
            date: new Date(),
        };
        await addTicketMessage(selectedTicket.id, message);
        
        // Optimistically update local state to show new message immediately
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
        setReplyMessage('');
        setIsSubmitting(false);
    }

    const getStatusColor = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-200 text-blue-800';
            case 'In Progress': return 'bg-yellow-200 text-yellow-800';
            case 'Resolved': return 'bg-green-200 text-green-800';
            case 'Closed': return 'bg-gray-200 text-gray-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-serif font-bold text-primary">Support Center</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors"
                >
                    Create New Ticket
                </button>
            </div>
            
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                {tickets.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-primary">{ticket.subject}</p>
                                        <p className="text-xs text-gray-500">Ticket ID: {ticket.id.slice(-8)} | Last updated: {ticket.updatedAt.toLocaleDateString()}</p>
                                    </div>
                                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">You have not created any support tickets yet.</p>
                )}
            </div>

            {/* View Ticket Modal */}
            {selectedTicket && (
                <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Ticket: ${selectedTicket.subject}`}>
                    <div className="space-y-4">
                        <div className="max-h-80 overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-md">
                            {selectedTicket.messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-xs ${msg.author === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {msg.author === 'admin' ? msg.adminName : 'You'} - {msg.date.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' && (
                             <div className="pt-4 border-t">
                                <textarea 
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    rows={3}
                                    placeholder="Type your reply..."
                                    className="w-full p-2 border rounded-md"
                                ></textarea>
                                <div className="text-right mt-2">
                                    <button onClick={handleSendReply} disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                        {isSubmitting ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Create Ticket Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create a New Support Ticket">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input type="text" id="subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea id="message" value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={5} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div className="text-right">
                        <button onClick={handleCreateTicket} disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-5 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupportView;
