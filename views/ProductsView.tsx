import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { useAppContext } from '../context/AppContext';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

interface ProductsViewProps {
    products: Product[];
    loading: boolean;
}

const priceRanges = [
    { label: 'All', value: 'all' },
    { label: 'Under ₹300', value: '0-300' },
    { label: '₹300 - ₹500', value: '300-500' },
    { label: '₹500 - ₹1000', value: '500-1000' },
    { label: 'Over ₹1000', value: '1000-Infinity' },
];

const sortOptions = [
    { label: 'Relevance', value: 'default' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A-Z', value: 'name-asc' },
    { label: 'Name: Z-A', value: 'name-desc' },
];

const stockStatusOptions = [
    { label: 'All', value: 'all' },
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Low Stock', value: 'low-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' },
];

const ProductsView: React.FC<ProductsViewProps> = ({ products, loading }) => {
    const { categories: allCategories } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Product[]>([]);
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');
    const [stockStatusFilter, setStockStatusFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    const listedProducts = useMemo(() => products.filter(p => p.isListed), [products]);

    const categories = useMemo(() => {
        return ['All', ...allCategories];
    }, [allCategories]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const lowercasedQuery = query.toLowerCase();
            const suggestions = listedProducts.filter(p => 
                p.name.toLowerCase().includes(lowercasedQuery) ||
                p.description.toLowerCase().includes(lowercasedQuery)
            ).slice(0, 5);
            setAutocompleteSuggestions(suggestions);
        } else {
            setAutocompleteSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (productName: string) => {
        setSearchQuery(productName);
        setAutocompleteSuggestions([]);
    };

    const resetFilters = () => {
        setSelectedCategory('All');
        setSearchQuery('');
        setSortBy('default');
        setPriceRange('all');
        setStockStatusFilter('all');
        setIsFilterOpen(false);
    };

    const filteredProducts = useMemo(() => {
        let tempProducts = [...listedProducts]; // Create a mutable copy

        // Filter by category
        if (selectedCategory !== 'All') {
            tempProducts = tempProducts.filter(product => product.category === selectedCategory);
        }
        
        // Filter by price range
        if (priceRange !== 'all') {
            const parts = priceRange.split('-').map(Number);
            const min = parts[0];
            const max = parts.length > 1 ? parts[1] : Infinity;
            
            tempProducts = tempProducts.filter(p => {
                const price = p.discountPrice ?? p.price;
                return price >= min && price <= max;
            });
        }

        // Filter by search query
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            tempProducts = tempProducts.filter(product =>
                product.name.toLowerCase().includes(lowercasedQuery) ||
                product.description.toLowerCase().includes(lowercasedQuery)
            );
        }

        // Filter by stock status
        switch (stockStatusFilter) {
            case 'in-stock':
                tempProducts = tempProducts.filter(p => p.stock > (p.reorderPoint || 5));
                break;
            case 'low-stock':
                tempProducts = tempProducts.filter(p => p.stock > 0 && p.stock <= (p.reorderPoint || 5));
                break;
            case 'out-of-stock':
                tempProducts = tempProducts.filter(p => p.stock === 0);
                break;
            case 'all':
            default:
                break;
        }
        
        // Sort products
        switch (sortBy) {
            case 'price-asc':
                tempProducts.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
                break;
            case 'price-desc':
                tempProducts.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
                break;
            case 'name-asc':
                tempProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                tempProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'default':
            default:
                // Keep default order, or you can sort by ID if needed
                break;
        }

        return tempProducts;
    }, [listedProducts, selectedCategory, searchQuery, sortBy, priceRange, stockStatusFilter]);

    const highlightMatch = (text: string, highlight: string) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <strong key={i} className="bg-yellow-200 text-yellow-800 font-bold rounded-sm">
                            {part}
                        </strong>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="container mx-auto px-6 py-12">
             <style>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-in { animation: slideIn 0.2s ease-out forwards; }
            `}</style>
            
            <h1 className="text-4xl font-serif font-bold text-center text-primary mb-8">Our Collection</h1>
            
            {/* Filter/Sort section */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-8 sticky top-20 z-30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                        />
                        {autocompleteSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                                {autocompleteSuggestions.map(p => {
                                    const lowercasedQuery = searchQuery.toLowerCase();
                                    const nameMatch = p.name.toLowerCase().includes(lowercasedQuery);
                                    // Match in description only if not in name, to avoid redundancy
                                    const descriptionMatch = !nameMatch && p.description.toLowerCase().includes(lowercasedQuery);

                                    let descriptionSnippet: React.ReactNode | null = null;
                                    if (descriptionMatch) {
                                        const matchIndex = p.description.toLowerCase().indexOf(lowercasedQuery);
                                        const start = Math.max(0, matchIndex - 30);
                                        const end = Math.min(p.description.length, matchIndex + searchQuery.length + 30);
                                        let snippet = p.description.substring(start, end);
                                        if (start > 0) snippet = "..." + snippet;
                                        if (end < p.description.length) snippet = snippet + "...";
                                        
                                        descriptionSnippet = highlightMatch(snippet, searchQuery);
                                    }

                                    return (
                                        <div 
                                            key={p.id}
                                            onClick={() => handleSuggestionClick(p.name)}
                                            className="px-5 py-3 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <div className="font-semibold text-primary text-sm">{highlightMatch(p.name, searchQuery)}</div>
                                            {descriptionSnippet && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {descriptionSnippet}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={resetFilters} className="p-3 text-gray-600 hover:text-primary transition-colors" title="Reset Filters">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4l-16 16" />
                            </svg>
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setIsFilterOpen(prev => !prev)}
                                className="p-3 border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                                title="Filters & Sort"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h9m-9 4h9m5-12v16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                                </svg>
                            </button>
                            {isFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded-lg shadow-xl p-4 space-y-4 z-20 animate-slide-in">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                                        <div className="flex flex-wrap gap-2">
                                            {priceRanges.map(range => (
                                                <button
                                                    key={range.value}
                                                    onClick={() => setPriceRange(range.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ priceRange === range.value ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by</label>
                                        <div className="flex flex-wrap gap-2">
                                             {sortOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setSortBy(option.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ sortBy === option.value ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
                                        <div className="flex flex-wrap gap-2">
                                            {stockStatusOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setStockStatusFilter(option.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ stockStatusFilter === option.value ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center flex-wrap gap-3 md:gap-4 mb-12">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-2 rounded-full font-medium text-sm md:text-base transition-all duration-300 ease-in-out transform hover:scale-105 ${
                            selectedCategory === category
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-white text-primary hover:bg-secondary border border-gray-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
                {loading ? (
                    Array.from({ length: 8 }).map((_, index) => <SkeletonProductCard key={index} />)
                ) : (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                    ))
                )}
            </div>
             {!loading && filteredProducts.length === 0 && (
                <p className="text-center col-span-full text-gray-500 mt-8">No products found matching your criteria.</p>
            )}
            
            <ProductQuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
};

export default ProductsView;