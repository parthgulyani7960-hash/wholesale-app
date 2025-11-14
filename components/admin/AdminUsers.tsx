import React from 'react';
import { User, UserRole } from '../../types';
// FIX: Replaced obsolete useAuth hook
import { useAppContext } from '../../context/AppContext';

interface AdminUsersProps {
    allUsers: User[];
    onUserUpdate: (updatedUserData: Partial<User> & { id: number }) => Promise<void>;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ allUsers, onUserUpdate }) => {
    // FIX: Replaced useAuth() with useAppContext()
    const { currentUser } = useAppContext();
    const canEdit = currentUser?.role === 'owner';
    const roles: UserRole[] = ['retailer', 'wholesaler', 'admin'];

    const handleRoleChange = async (userId: number, newRole: UserRole) => {
        if (!canEdit) return;
        await onUserUpdate({ id: userId, role: newRole });
    };

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold mb-6">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Email / Username</th>
                            <th className="py-3 px-4 text-center">Role</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {allUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4 text-left">{user.name}</td>
                                <td className="py-3 px-4 text-left">{user.email}</td>
                                <td className="py-3 px-4 text-center">
                                    {canEdit && user.id !== currentUser.id && user.role !== 'owner' ? (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="p-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="capitalize py-1 px-3 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                                            {user.role}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;