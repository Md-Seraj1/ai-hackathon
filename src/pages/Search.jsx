import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search as SearchIcon, X, TrendingUp, Clock, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/product/ProductCard';

export const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const recentSearches = ['Denim Jacket', 'Gold Watch', 'Summer Dress'];
    const trending = ['Vintage', 'Smart Watch', 'Streetwear', 'Leather'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) throw error;

            const mappedProducts = (data || []).map(p => ({
                ...p,
                price: p.base_price,
                image: p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300'
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error('Error fetching search products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = query
        ? products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
        )
        : [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Search Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
                        <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search clothes, jewellery..."
                            className="w-full bg-slate-100 h-10 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {['All', 'Clothes', 'Jewellery', 'Watches', 'On Sale'].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeFilter === f
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-4 grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : query ? (
                // Results
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-slate-900">Results ({filteredProducts.length})</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {filteredProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p>No results found for "{query}"</p>
                        </div>
                    )}
                </div>
            ) : (
                // Initial State
                <div className="p-5">
                    {/* Recent */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 ml-1">Recent Searches</h3>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map(s => (
                                <button key={s} onClick={() => setQuery(s)} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-left hover:border-slate-300">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-sm text-slate-600 font-medium">{s}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trending */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-900">Trending Now</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {trending.map((t, i) => (
                                <button key={t} onClick={() => setQuery(t)} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center">#{i + 1}</span>
                                        <span className="text-sm font-medium text-slate-700">{t}</span>
                                    </div>
                                    <ArrowLeft size={16} className="text-slate-300 rotate-180" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

