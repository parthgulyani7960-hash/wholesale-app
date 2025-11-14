
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Coupon, User } from '../../types';
import Modal from '../Modal';

const CouponForm: React.FC<{ couponToEdit?: Coupon; onFormSubmit: () => void; users: User[] }> = ({ couponToEdit, onFormSubmit, users }) => {
    const { addCoupon, updateCoupon } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        code: couponToEdit ? couponToEdit.code : '',
        type: couponToEdit ? couponToEdit.type : 'fixed',
        value: couponToEdit ? couponToEdit.value.toString() : '',
        minOrderValue: couponToEdit ? couponToEdit.minOrderValue?.toString() || '' : '',
        isActive: couponToEdit ? couponToEdit.isActive : true,
        userId: couponToEdit ? couponToEdit.userId?.toString() || '' : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const couponData = {
            code: formData.code.toUpperCase(),
            type: formData.type as 'fixed' | 'percentage',
            value: parseFloat(formData.value) || 0,
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
            isActive: formData.isActive,
            userId: formData.userId ? parseInt(formData.userId, 10) : undefined,
        };

        if (couponToEdit) {
            await updateCoupon({ ...couponToEdit, ...couponData });
        } else {
            await addCoupon(couponData);
        }
        setIsSaving(false);
        onFormSubmit();
    };
    
    const customerUsers = users.filter(u => u.role === 'retailer' || u.role === 'wholesaler');

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Value</label>
                    <input type="number" step="0.01" name="value" value={formData.value} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Order Value (Optional)</label>
                <input type="number" step="0.01" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Assign to Specific User (Optional)</label>
                <select name="userId" value={formData.userId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">No Specific User (Public)</option>
                    {customerUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center justify-between">
                <label className="flex items-center">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-accent border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
            </div>
            <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSaving} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const AdminCoupons: React.FC = () => {
    const { coupons, deleteCoupon, users } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);

    const openAddModal = () => {
        setEditingCoupon(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = async (couponCode: string) => {
        if (window.confirm(`Are you sure you want to delete the coupon "${couponCode}"?`)) {
            await deleteCoupon(couponCode);
        }
    };

    const getUserName = (userId?: number) => {
        if (!userId) return <span className="text-gray-500">All Users</span>;
        const user = users.find(u => u.id === userId);
        return user ? user.name : <span className="text-red-500">Unknown User</span>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Manage Coupons</h2>
                <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-accent hover:text-primary">
                    Add Coupon
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Code</th>
                            <th className="py-3 px-4 text-left">Type</th>
                            <th className="py-3 px-4 text-center">Value</th>
                            <th className="py-3 px-4 text-center">Min Order</th>
                            <th className="py-3 px-4 text-left">User Specific</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {coupons.map(coupon => (
                            <tr key={coupon.code} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-mono font-bold">{coupon.code}</td>
                                <td className="py-3 px-4 capitalize">{coupon.type}</td>
                                <td className="py-3 px-4 text-center">{coupon.type === 'fixed' ? `₹${coupon.value}` : `${coupon.value}%`}</td>
                                <td className="py-3 px-4 text-center">{coupon.minOrderValue ? `₹${coupon.minOrderValue}` : '-'}</td>
                                <td className="py-3 px-4">{getUserName(coupon.userId)}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`py-1 px-2.5 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex item-center justify-center space-x-3">
                                        <button onClick={() => openEditModal(coupon)} className="text-accent hover:underline text-xs">Edit</button>
                                        <button onClick={() => handleDelete(coupon.code)} className="text-red-500 hover:underline text-xs">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}>
                <CouponForm couponToEdit={editingCoupon} onFormSubmit={() => setIsModalOpen(false)} users={users} />
            </Modal>
        </div>
    );
};

export default AdminCoupons;
