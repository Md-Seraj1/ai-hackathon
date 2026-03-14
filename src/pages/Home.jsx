import React, { useEffect, useState } from 'react';
import { Search, Bell, Shirt, Watch, Gem } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../lib/store';

export const Home = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const [unreadCount, setUnreadCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        if (user) {
            fetchUnread();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database fields to component fields if they differ
            const mappedProducts = (data || []).map(p => ({
                ...p,
                price: p.base_price,
                image: p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300'
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnread = async () => {
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        setUnreadCount(count || 0);
    };

    useEffect(() => {
        if (!user) return;

        // Subscribe to changes
        const subscription = supabase
            .channel('notifications_count')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchUnread();
            })
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, [user]);

    // Static Categories with Icons
    const categories = [
        { id: '1', name: 'Clothes', slug: 'clothes', icon: Shirt, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: '2', name: 'Jewellery', slug: 'jewellery', icon: Gem, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: '3', name: 'Watches', slug: 'watches', icon: Watch, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="flex flex-col gap-6 pb-24">
            {/* Header omitted for brevity as it remains same but use unreadCount */}
            {/* ... Header ... */}
            <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Discover
                    </h1>
                    <p className="text-slate-500 text-xs">Find your best style</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/search')}
                        className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <Search size={20} />
                    </button>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 relative transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                        )}
                    </button>
                </div>
            </header>

            {/* Hero Banner */}
            <section className="px-5">
                <div className="relative h-48 w-full rounded-3xl overflow-hidden shadow-lg shadow-blue-900/10 group">
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200"
                        alt="New Collection"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                        <span className="text-white/80 text-xs uppercase font-bold tracking-wider mb-1">New Arrivals</span>
                        <h2 className="text-2xl font-bold text-white mb-2">Summer Collection</h2>
                        <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold w-fit hover:bg-slate-100 transition-colors">
                            Shop Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories (Icons) */}
            <section>
                <div className="px-5 flex items-center justify-between mb-3">
                    <h2 className="font-bold text-lg text-slate-900">Categories</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide snap-x">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/category/${cat.slug}`)}
                                className="flex flex-col items-center gap-2 min-w-[72px] snap-center group"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${cat.bg} transition-transform duration-300 group-hover:scale-105 group-active:scale-95`}>
                                    <Icon size={28} className={cat.color} strokeWidth={2} />
                                </div>
                                <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Featured Products */}
            <section className="px-5 pb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-lg text-slate-900">Popular items</h2>
                    <button className="text-blue-600 text-xs font-medium">Sort by</button>
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
                    <div className="text-center py-10 text-slate-400">
                        <p>No products found yet.</p>
                    </div>
                )}
            </section>

        </div>
    );
};

