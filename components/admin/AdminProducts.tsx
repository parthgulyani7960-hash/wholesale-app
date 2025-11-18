
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types';
import Modal from '../Modal';
import ProductForm from '../ProductForm';

const AdminProducts: React.FC = () => {
    const { products, updateProduct, deleteProduct, categories, addCategory, deleteCategory } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [filters, setFilters] = useState({ query: '', category: 'All', stock: 'All' });

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (filters.category !== 'All' && p.category !== filters.category) {
                return false;
            }
            if (filters.query && !p.name.toLowerCase().includes(filters.query.toLowerCase())) {
                return false;
            }
            if (filters.stock !== 'All') {
                if (filters.stock === 'in-stock' && p.stock <= (p.reorderPoint || 5)) return false;
                if (filters.stock === 'low-stock' && (p.stock === 0 || p.stock > (p.reorderPoint || 5))) return false;
                if (filters.stock === 'out-of-stock' && p.stock > 0) return false;
            }
            return true;
        });
    }, [products, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const openAddModal = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(undefined);
    };

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product permanently?')) {
            await deleteProduct(productId);
        }
    }

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName);
            setNewCategoryName('');
        }
    };

    const handleDeleteCategory = (category: string) => {
        if (window.confirm(`Are you sure you want to delete the "${category}" category? This cannot be undone.`)) {
            deleteCategory(category);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Manage Products</h2>
                <button
                    onClick={openAddModal}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors"
                >
                    Add Product
                </button>
            </div>

             <div className="mb-6 p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    name="query"
                    value={filters.query}
                    onChange={handleFilterChange}
                    placeholder="Search by product name..."
                    className="md:col-span-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <select name="category" value={filters.category} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                 <select name="stock" value={filters.stock} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="All">All Stock Statuses</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                </select>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Product Name</th>
                            <th className="py-3 px-4 text-left">Category</th>
                            <th className="py-3 px-4 text-center">Price</th>
                            <th className="py-3 px-4 text-center">Stock</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {filteredProducts.map(product => {
                            const isLowStock = product.stock > 0 && product.stock <= (product.reorderPoint || 5);
                            return (
                                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-left flex items-center">
                                        <img src={product.imageUrls[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-4" />
                                        {product.name}
                                    </td>
                                    <td className="py-3 px-4 text-left">{product.category}</td>
                                    <td className="py-3 px-4 text-center">
                                        {product.discountPrice ? (
                                            <span>
                                                <span className="text-red-600 font-bold">₹{product.discountPrice.toFixed(2)}</span>
                                                <span className="line-through text-gray-500 ml-1">₹{product.price.toFixed(2)}</span>
                                            </span>
                                        ) : (
                                            `₹${product.price.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={isLowStock ? 'font-bold text-orange-600' : ''}>
                                            {product.stock}
                                        </span>
                                        {isLowStock && <span className="text-xs text-orange-500 block">Low Stock</span>}
                                        {product.stock === 0 && <span className="text-xs text-red-500 block font-semibold">Out of Stock</span>}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={product.isListed}
                                                onChange={(e) => updateProduct({ ...product, isListed: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                        <span className="text-xs ml-2">{product.isListed ? 'Listed' : 'Unlisted'}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex item-center justify-center space-x-2">
                                            <button onClick={() => openEditModal(product)} className="text-accent hover:underline text-xs">Edit</button>
                                            <button 
                                                onClick={() => updateProduct({ ...product, stock: 0 })} 
                                                disabled={product.stock === 0}
                                                className="text-orange-600 hover:underline text-xs disabled:text-gray-400 disabled:no-underline"
                                            >
                                                Out of Stock
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredProducts.length === 0 && <p className="text-center py-8 text-gray-500">No products match your filters.</p>}
            </div>

            <div className="mt-8 pt-6 border-t">
                <h3 className="text-xl font-serif font-bold mb-4">Category Management</h3>
                <div className="max-w-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="newCategory" className="text-sm font-medium">Add New Category</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                id="newCategory"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="e.g., Dairy"
                            />
                            <button onClick={handleAddCategory} className="bg-primary text-white px-4 py-2 rounded-md text-sm">Add</button>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-1">Existing Categories</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
                            {categories.map(cat => (
                                <div key={cat} className="flex justify-between items-center text-sm bg-white p-1.5 rounded">
                                    <span>{cat}</span>
                                    <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 hover:text-red-700 text-lg">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
                <ProductForm productToEdit={editingProduct} onFormSubmit={closeModal} />
            </Modal>
        </div>
    );
};

export default AdminProducts;
