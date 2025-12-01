
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types';
import Modal from '../Modal';
import ProductForm from '../ProductForm';

const AdminProducts: React.FC = () => {
    const { products, updateProduct, deleteProduct, categories, addCategory, deleteCategory, showNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [filters, setFilters] = useState({ query: '', category: 'All', stock: 'All' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
    const bulkActionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target as Node)) {
                setIsBulkActionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        setSelectedIds([]); // Clear selection on filter change
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`)) {
            for (const id of selectedIds) {
                await deleteProduct(id);
            }
            setSelectedIds([]);
            showNotification(`Deleted ${selectedIds.length} products.`);
        }
    };

    const handleBulkStockUpdate = async (stockValue: number) => {
        const action = stockValue === 0 ? 'Out of Stock' : `In Stock (${stockValue})`;
        if (window.confirm(`Mark ${selectedIds.length} products as ${action}?`)) {
            for (const id of selectedIds) {
                const product = products.find(p => p.id === id);
                if (product) await updateProduct({ ...product, stock: stockValue });
            }
            setSelectedIds([]);
            showNotification('Stock updated for selected products.');
        }
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
        <div className="relative">
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
            
            <div className="overflow-x-auto mb-16"> {/* Added margin bottom for floating bar */}
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white text-sm">
                        <tr>
                            <th className="py-3 px-4 text-center w-12">
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll}
                                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                                    className="h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent cursor-pointer"
                                />
                            </th>
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
                            const isSelected = selectedIds.includes(product.id);
                            return (
                                <tr key={product.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                    <td className="py-3 px-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            onChange={() => handleSelectOne(product.id)}
                                            className="h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent cursor-pointer"
                                        />
                                    </td>
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

            {selectedIds.length > 0 && (
                <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-40 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm whitespace-nowrap">{selectedIds.length} selected</span>
                        <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-gray-600 text-lg leading-none" title="Clear Selection">&times;</button>
                    </div>
                    <div className="h-6 w-px bg-gray-300"></div>
                    
                    <button 
                        onClick={() => handleBulkStockUpdate(0)}
                        className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors whitespace-nowrap"
                    >
                        Mark Out of Stock
                    </button>
                    
                    <div className="h-6 w-px bg-gray-300"></div>

                    <button 
                        onClick={handleBulkDelete}
                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete Selected
                    </button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
                <ProductForm productToEdit={editingProduct} onFormSubmit={closeModal} />
            </Modal>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
