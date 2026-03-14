// Update 2
// Update 1
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/product/ProductCard';

export const CategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simple mapping for display titles
    const categoryTitles = {
        'clothes': 'Clothes',
        'jewellery': 'Jewellery',
        'watches': 'Watches'
    };

    const title = categoryTitles[slug] || 'Category';

    useEffect(() => {
        fetchCategoryProducts();
    }, [slug]);

    const fetchCategoryProducts = async () => {
        setLoading(true);
        try {
            // First get the category ID
            const { data: categoryData } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', slug)
                .single();

            if (categoryData) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category_id', categoryData.id);

                if (error) throw error;

                const mappedProducts = (data || []).map(p => ({
                    ...p,
                    price: p.base_price,
                    image: p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300'
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching category products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 capitalize">{title}</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600">
                        <Search size={20} />
                    </button>
                    <button className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600">
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500 font-medium">{products.length} items found</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                        <ShoppingBag size={48} className="mb-4 opacity-50" />
                        <p className="font-medium">No products found in this category.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
