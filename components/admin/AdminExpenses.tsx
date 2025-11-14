import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import Modal from '../Modal';

const ExpenseForm: React.FC<{ expenseToEdit?: Expense; onFormSubmit: () => void; }> = ({ expenseToEdit, onFormSubmit }) => {
    const { addExpense, updateExpense } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        date: expenseToEdit ? expenseToEdit.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expenseToEdit ? expenseToEdit.description : '',
        amount: expenseToEdit ? expenseToEdit.amount.toString() : '',
        category: expenseToEdit ? expenseToEdit.category : 'Miscellaneous',
    });
    const [error, setError] = useState('');
    
    const categories: ExpenseCategory[] = ['Stock Purchase', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Miscellaneous'];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validate = () => {
        const numericAmount = parseFloat(formData.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Amount must be a positive number.');
            return false;
        }
        setError('');
        return true;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setIsSaving(true);
        
        const expenseData = {
            date: new Date(formData.date),
            description: formData.description,
            amount: parseFloat(formData.amount) || 0,
            category: formData.category as ExpenseCategory,
        };
        
        if (expenseToEdit) {
            await updateExpense({ ...expenseToEdit, ...expenseData });
        } else {
            await addExpense(expenseData);
        }
        
        setIsSaving(false);
        onFormSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`} required />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSaving} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : (expenseToEdit ? 'Save Changes' : 'Add Expense')}
                </button>
            </div>
        </form>
    );
};

const AdminExpenses: React.FC = () => {
    const { expenses, deleteExpense } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    
    const totalThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return expenses
            .filter(e => e.date >= startOfMonth)
            .reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    const openAddModal = () => {
        setEditingExpense(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (expenseId: string) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            await deleteExpense(expenseId);
        }
    };
    
    const categoryColors: { [key in ExpenseCategory]: string } = {
        'Stock Purchase': 'bg-blue-100 text-blue-800',
        'Rent': 'bg-red-100 text-red-800',
        'Utilities': 'bg-yellow-100 text-yellow-800',
        'Salaries': 'bg-green-100 text-green-800',
        'Marketing': 'bg-purple-100 text-purple-800',
        'Miscellaneous': 'bg-gray-200 text-gray-800',
    };

    return (
        <div>
             <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold">Expense Tracking</h2>
                    <p className="text-sm text-gray-500">Log and manage your business expenses.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Total This Month</p>
                        <p className="font-bold text-lg text-primary">₹{totalThisMonth.toFixed(2)}</p>
                    </div>
                    <button onClick={openAddModal} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-accent hover:text-primary transition-colors">
                        Add Expense
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-left">Description</th>
                            <th className="py-3 px-4 text-center">Category</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {expenses.map(exp => (
                            <tr key={exp.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{exp.date.toLocaleDateString()}</td>
                                <td className="py-3 px-4">{exp.description}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`py-1 px-2.5 rounded-full text-xs font-medium ${categoryColors[exp.category]}`}>
                                        {exp.category}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right font-mono">₹{exp.amount.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex item-center justify-center space-x-2">
                                        <button onClick={() => openEditModal(exp)} className="text-accent hover:underline text-xs">Edit</button>
                                        <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {expenses.length === 0 && <p className="text-center p-8 text-gray-500">No expenses recorded yet.</p>}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}>
                <ExpenseForm expenseToEdit={editingExpense} onFormSubmit={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default AdminExpenses;
