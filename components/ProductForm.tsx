
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

interface ProductFormProps {
    productToEdit?: Product;
    onFormSubmit: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onFormSubmit }) => {
    const { addProduct, updateProduct, categories: availableCategories } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        wholesalePrice: '',
        discountPrice: '',
        discountPercentage: '',
        category: '',
        stock: '',
        reorderPoint: '',
        maxOrderQuantity: '',
    });
    const [tags, setTags] = useState<string[]>([]);
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const tagDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const availableTags: Array<Product['tags'][number]> = ['New Arrival', 'Best Seller', 'On Sale', 'Organic', 'Local Favorite'];

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description,
                price: productToEdit.price.toString(),
                wholesalePrice: productToEdit.wholesalePrice.toString(),
                discountPrice: productToEdit.discountPrice?.toString() || '',
                discountPercentage: productToEdit.discountPercentage?.toString() || '',
                category: productToEdit.category,
                stock: productToEdit.stock.toString(),
                reorderPoint: productToEdit.reorderPoint?.toString() || '',
                maxOrderQuantity: productToEdit.maxOrderQuantity?.toString() || '',
            });
            setTags(productToEdit.tags || []);
            setImages(productToEdit.imageUrls);
        } else {
             setFormData({ name: '', description: '', price: '', wholesalePrice: '', discountPrice: '', discountPercentage: '', category: availableCategories[0] || '', stock: '', reorderPoint: '', maxOrderQuantity: '' });
             setTags([]);
             setImages([]);
        }
    }, [productToEdit, availableCategories]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
                setIsTagDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calculate discount price from percentage
    useEffect(() => {
        const price = parseFloat(formData.price);
        const percentage = parseFloat(formData.discountPercentage);
        if (!isNaN(price) && !isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            const discounted = price * (1 - percentage / 100);
            setFormData(prev => ({ ...prev, discountPrice: discounted.toFixed(2) }));
        }
    }, [formData.discountPercentage, formData.price]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // If discount price is changed manually, clear the percentage
    const handleDiscountPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, discountPrice: e.target.value, discountPercentage: '' }));
    };

    const handleTagToggle = (tag: string) => {
        setTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };
    
    const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            filesArray.forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
            // Clear input so same files can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleMarkOutOfStock = () => {
        setFormData(prev => ({...prev, stock: '0'}));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        
        // Price validations
        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            newErrors.price = 'Price must be a non-negative number.';
        }
        
        const wholesalePrice = parseFloat(formData.wholesalePrice);
        if (isNaN(wholesalePrice) || wholesalePrice < 0) {
            newErrors.wholesalePrice = 'Wholesale price must be a non-negative number.';
        }

        if (formData.discountPrice) {
            const discountPrice = parseFloat(formData.discountPrice);
            if (isNaN(discountPrice) || discountPrice < 0) {
                newErrors.discountPrice = 'Discount price must be a non-negative number.';
            } else if (!isNaN(price) && price >= 0 && discountPrice > price) {
                newErrors.discountPrice = 'Discount price cannot be greater than the retail price.';
            }
        }
        
        // Integer validations
        const stock = parseFloat(formData.stock);
        if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
            newErrors.stock = 'Stock must be a non-negative integer.';
        }

        if (formData.reorderPoint) {
            const reorderPoint = parseFloat(formData.reorderPoint);
            if (isNaN(reorderPoint) || reorderPoint < 0 || !Number.isInteger(reorderPoint)) {
                newErrors.reorderPoint = 'Reorder point must be a non-negative integer.';
            }
        }

        if (formData.maxOrderQuantity) {
            const maxOrderQuantity = parseFloat(formData.maxOrderQuantity);
            if (isNaN(maxOrderQuantity) || maxOrderQuantity < 0 || !Number.isInteger(maxOrderQuantity)) {
                newErrors.maxOrderQuantity = 'Max order quantity must be a non-negative integer.';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        
        setIsSaving(true);
        const productData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price) || 0,
            wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
            discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
            discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
            imageUrls: images,
            category: formData.category,
            stock: parseInt(formData.stock, 10) || 0,
            reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint, 10) : undefined,
            maxOrderQuantity: formData.maxOrderQuantity ? parseInt(formData.maxOrderQuantity, 10) : undefined,
            tags: tags as Product['tags'],
        };

        if (productToEdit) {
            await updateProduct({ ...productToEdit, ...productData });
        } else {
            await addProduct(productData);
        }
        setIsSaving(false);
        onFormSubmit();
    };

    const inputClass = (fieldName: keyof typeof formData) => `mt-1 block w-full px-3 py-2 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent`;
    const ErrorMessage: React.FC<{ fieldName: keyof typeof formData }> = ({ fieldName }) => errors[fieldName] ? <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p> : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Retail Price</label>
                    <input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} className={inputClass('price')} required />
                    <ErrorMessage fieldName="price" />
                </div>
                 <div>
                    <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700">Wholesale Price</label>
                    <input type="number" step="0.01" name="wholesalePrice" id="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} className={inputClass('wholesalePrice')} required />
                    <ErrorMessage fieldName="wholesalePrice" />
                </div>
                 <div>
                    <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">Discount %</label>
                    <input type="number" name="discountPercentage" id="discountPercentage" value={formData.discountPercentage} onChange={handleChange} placeholder="e.g., 10" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                </div>
                 <div>
                    <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">Discount Price (Auto)</label>
                    <input type="number" step="0.01" name="discountPrice" id="discountPrice" value={formData.discountPrice} onChange={handleDiscountPriceChange} className={inputClass('discountPrice')} />
                    <ErrorMessage fieldName="discountPrice" />
                </div>
                 <div className="col-span-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <fieldset className="border p-4 rounded-md">
                <legend className="px-2 font-semibold text-gray-700">Stock & Inventory</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Current Stock</label>
                        <div className="mt-1 flex gap-2">
                            <input 
                                type="text"
                                name="stock" 
                                id="stock" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                className={inputClass('stock')} required 
                            />
                            <button type="button" onClick={handleMarkOutOfStock} className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 whitespace-nowrap">
                                Out of Stock
                            </button>
                        </div>
                         <ErrorMessage fieldName="stock" />
                    </div>
                    <div>
                        <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700">Reorder Point</label>
                        <input 
                            type="text"
                            name="reorderPoint" 
                            id="reorderPoint" 
                            value={formData.reorderPoint} 
                            onChange={handleChange} 
                            className={inputClass('reorderPoint')}
                            placeholder="e.g., 10"
                        />
                         <ErrorMessage fieldName="reorderPoint" />
                        <p className="text-xs text-gray-500 mt-1">Triggers "Low Stock" warning.</p>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="maxOrderQuantity" className="block text-sm font-medium text-gray-700">Max Order Quantity Per Customer</label>
                        <input 
                            type="text"
                            name="maxOrderQuantity" 
                            id="maxOrderQuantity" 
                            value={formData.maxOrderQuantity} 
                            onChange={handleChange} 
                            className={`max-w-xs ${inputClass('maxOrderQuantity')}`}
                            placeholder="e.g., 5"
                        />
                         <ErrorMessage fieldName="maxOrderQuantity" />
                        <p className="text-xs text-gray-500 mt-1">Limits quantity per single order.</p>
                    </div>
                </div>
            </fieldset>

             <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="relative" ref={tagDropdownRef}>
                    <div 
                        onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                        className="mt-1 flex items-center flex-wrap gap-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer min-h-[42px]"
                    >
                        {tags.length > 0 ? (
                            tags.map(tag => (
                                <span key={tag} className="bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTagToggle(tag);
                                        }}
                                        className="text-white/70 hover:text-white"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">Select tags...</span>
                        )}
                    </div>
                    {isTagDropdownOpen && (
                        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                            {availableTags.map(tag => (
                                <label key={tag} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={tags.includes(tag)} 
                                        onChange={() => handleTagToggle(tag)}
                                        className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">{tag}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="space-y-4">
                     {/* Thumbnails Grid */}
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                            {images.map((imageSrc, index) => (
                                <div key={index} className="relative group w-24 h-24">
                                    <img src={imageSrc} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transform scale-0 group-hover:scale-100 transition-transform duration-200"
                                        title="Remove Image"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Area */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-accent/50 transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                        <p className="text-xs text-gray-400 mt-1">Supports multiple files (JPG, PNG, WEBP)</p>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            multiple 
                            accept="image/*" 
                            onChange={handleImageFilesChange} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSaving} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-300 disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : (productToEdit ? 'Save Changes' : 'Add Product')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
