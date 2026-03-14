import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../lib/store';
import { ProductCard } from '../components/product/ProductCard';

export const Wishlist = () => {
    const navigate = useNavigate();
    const { user, wishlist } = useUserStore();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user]);

    // Update local product list when global wishlist IDs change (e.g. removed from a card)
    useEffect(() => {
        setWishlistItems(prev => prev.filter(item => wishlist.includes(item.product_id)));
    }, [wishlist]);

    const fetchWishlist = async () => {
        try {
            const { data, error } = await supabase
                .from('wishlists')
                .select(`
                    *,
                    products (*)
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            // Map database fields to component fields for ProductCard compatibility
            const mappedData = (data || []).map(item => ({
                ...item,
                products: {
                    ...item.products,
                    price: item.products.base_price,
                    image: item.products.images?.[0] || 'https://via.placeholder.com/300'
                }
            }));

            setWishlistItems(mappedData);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user && !loading) {
            setLoading(false); // Handle edge case where user might be null but load finished
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">My Wishlist</h1>
                <span className="ml-auto text-xs font-bold bg-pink-50 text-pink-500 px-3 py-1 rounded-full">
                    {wishlistItems.length} items
                </span>
            </header>

            <main className="flex-1 p-5">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center">
                            <Heart size={32} className="text-pink-200" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-900 mb-1">Your wishlist is empty</p>
                            <p className="text-sm">Save items you like to see them here.</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-2 text-blue-600 font-bold text-sm hover:underline"
                        >
                            Explore Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {wishlistItems.map((item) => (
                            <ProductCard key={item.id} product={item.products} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
