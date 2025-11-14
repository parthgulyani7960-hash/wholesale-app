import React, { useState, useMemo } from 'react';
import { SupportTicket, SupportTicketStatus, SupportMessage } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../Modal';

const AdminSupportTickets: React.FC = () => {
    const { tickets, updateTicketStatus, addTicketMessage, currentUser } = useAppContext();
    const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'All'>('All');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const filteredTickets = useMemo(() => {
        const sortedTickets = [...tickets].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        if (statusFilter === 'All') return sortedTickets;
        return sortedTickets.filter(ticket => ticket.status === statusFilter);
    }, [tickets, statusFilter]);

    const statusOptions: Array<SupportTicketStatus | 'All'> = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

    const getStatusColor = (status: SupportTicketStatus) => {
        switch (status) {
            case 'Open': return 'bg-blue-200 text-blue-800';
            case 'In Progress': return 'bg-yellow-200 text-yellow-800';
            case 'Resolved': return 'bg-green-200 text-green-800';
            case 'Closed': return 'bg-gray-200 text-gray-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };
    
    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedTicket || !currentUser) return;
        setIsReplying(true);
        const message: SupportMessage = {
            author: 'admin',
            adminName: currentUser.name,
            text: replyMessage,
            date: new Date(),
        };
        await addTicketMessage(selectedTicket.id, message);
        
        // Optimistically update local state
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, message], status: 'In Progress' } : null);
        
        setReplyMessage('');
        setIsReplying(false);
    };

    const handleStatusChange = async (ticketId: string, status: SupportTicketStatus) => {
        await updateTicketStatus(ticketId, status);
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket(prev => prev ? { ...prev, status } : null);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Support Tickets</h2>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700 mr-2">Filter by status:</span>
                {statusOptions.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            statusFilter === status 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Ticket ID</th>
                            <th className="py-3 px-4 text-left">Customer</th>
                            <th className="py-3 px-4 text-left">Subject</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-left">Last Updated</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                                <td className="py-3 px-4 font-mono">{ticket.id.slice(-8)}</td>
                                <td className="py-3 px-4">{ticket.userName}</td>
                                <td className="py-3 px-4 font-semibold">{ticket.subject}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`py-1 px-2.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">{ticket.updatedAt.toLocaleString()}</td>
                                <td className="py-3 px-4 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }} className="text-accent hover:underline text-xs">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {filteredTickets.length === 0 && <p className="text-center p-8 text-gray-500">No tickets found.</p>}

            {selectedTicket && (
                <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Ticket: ${selectedTicket.subject}`}>
                    <div className="space-y-4">
                        <div className="max-h-80 overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-md">
                            {selectedTicket.messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.author === 'admin' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-xs ${msg.author === 'admin' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {msg.author === 'user' ? selectedTicket.userName : (msg.adminName || 'Admin')} - {msg.date.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                         <div className="pt-4 border-t">
                            <h3 className="text-base font-semibold mb-2">Update Status & Reply</h3>
                            <div className="flex gap-4 items-center mb-4">
                                <label className="text-sm font-medium">Status:</label>
                                <select 
                                    value={selectedTicket.status} 
                                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as SupportTicketStatus)}
                                    className="p-1 border border-gray-300 rounded-md text-sm"
                                >
                                    {statusOptions.filter(s => s !== 'All').map(s => <option key={s as string} value={s as string}>{s}</option>)}
                                </select>
                            </div>
                            <textarea 
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                rows={3}
                                placeholder="Type your reply..."
                                className="w-full p-2 border rounded-md"
                                disabled={selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved'}
                            ></textarea>
                            <div className="text-right mt-2">
                                <button onClick={handleSendReply} disabled={isReplying || !replyMessage.trim()} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                    {isReplying ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminSupportTickets;
