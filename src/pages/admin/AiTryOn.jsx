// Update 2
// Update 1
import React, { useState, useEffect } from 'react';
import {
    Search,
    Sparkles,
    Filter,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export const AiTryOn = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [updatingId, setUpdatingId] = useState(null);
    const pageSize = 12;

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page, searchTerm, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const { data } = await supabase.from('categories').select('*');
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*, categories(name)', { count: 'exact' });

            if (searchTerm) {
                query = query.ilike('name', `%${searchTerm}%`);
            }

            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAi = async (product) => {
        setUpdatingId(product.id);
        const newValue = !product.is_ai_enabled;

        try {
            const { error } = await supabase
                .from('products')
                .update({ is_ai_enabled: newValue })
                .eq('id', product.id);

            if (error) throw error;

            // Optimistic update
            setProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, is_ai_enabled: newValue } : p
            ));

            // Show toast/alert (simple console for now or use a toast lib if available)
            // Assuming no toast lib configured globally yet based on previous files, using custom alert or just relying on UI state

            if (newValue) {
                // Determine logic mapping (in a real app this would call an API or store metadata)
                const categoryName = product.categories?.name?.toLowerCase();
                const logicType = categoryName?.includes('access') ? 'accessory-mode' : 'apparel-mode';
                console.log(`Enabled ${logicType} for ${product.name}`);
            }

        } catch (error) {
            console.error('Error updating AI status:', error);
            alert('Failed to update AI status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-violet-600" />
                    AI Try-On Management
                </h1>
                <p className="text-slate-500 text-sm">Control which products are available for virtual try-on.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-12 pl-11 pr-8 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none font-medium text-slate-600"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">AI Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading products...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                    {product.is_ai_enabled && (
                                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{product.name}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{product.brand || 'No brand'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                {product.categories?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${product.is_ai_enabled
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                {product.is_ai_enabled ? (
                                                    <>
                                                        <CheckCircle2 size={12} className="fill-emerald-600 text-white" />
                                                        ACTIVE
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={12} className="fill-slate-400 text-white" />
                                                        DISABLED
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleAi(product)}
                                                disabled={updatingId === product.id}
                                                className={`
                                                    relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                                                    ${product.is_ai_enabled ? 'bg-blue-600' : 'bg-slate-200'}
                                                    ${updatingId === product.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm
                                                        ${product.is_ai_enabled ? 'translate-x-7' : 'translate-x-1'}
                                                    `}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-400">Page {page}</p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={products.length < pageSize}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
