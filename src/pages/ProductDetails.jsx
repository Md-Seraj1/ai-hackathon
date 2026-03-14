import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Share2, Heart, ShoppingBag, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useCartStore, useUserStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const addItem = useCartStore(state => state.addItem);
    const { user, wishlist, toggleWishlist } = useUserStore();
    const [isToggling, setIsToggling] = useState(false);

    const [selectedSize, setSelectedSize] = useState('M');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(slug, name)')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setProduct({
                    ...data,
                    price: data.base_price,
                    image: data.images && data.images.length > 0 ? data.images[0] : 'https://via.placeholder.com/300',
                    reviews: data.review_count,
                    categorySlug: data.categories?.slug || 'clothes',
                });
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = product ? wishlist.includes(product.id) : false;

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (isToggling || !product) return;

        setIsToggling(true);
        toggleWishlist(product.id);

        try {
            if (isInWishlist) {
                await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
            } else {
                await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toggleWishlist(product.id);
        } finally {
            setIsToggling(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (!product) {
        return <div className="p-8 text-center flex flex-col items-center gap-4">
            <p className="text-slate-500">Product not found</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>;
    }

    const sizes = ['XS', 'S', 'M', 'L', 'XL'];

    return (
        <div className="min-h-screen bg-white pb-24 relative">
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleToggleWishlist}
                        className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
                    >
                        <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : "text-slate-900"} />
                    </button>
                    <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                        <Share2 size={20} />
                    </button>
                </div>
            </header>

            <div className="h-[50vh] bg-slate-100 relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-6 -mt-6 bg-white rounded-t-3xl relative z-0">
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-1 block">{product.brand}</span>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2">
                            <Star className="fill-amber-400 text-amber-400" size={16} />
                            <span className="font-bold text-slate-900">{product.rating}</span>
                            <span className="text-slate-400 text-sm">({product.reviews} reviews)</span>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        Rs {product.price}
                    </div>
                </div>

                {product.is_ai_enabled && (
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-4 mb-8 text-white flex items-center justify-between shadow-lg shadow-violet-200">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Camera size={20} />
                                <span className="font-bold">AI Virtual Try-On</span>
                            </div>
                            <p className="text-white/80 text-xs">See how it looks on you before buying!</p>
                        </div>
                        <Button
                            onClick={() => navigate('/try-on', { state: { product } })}
                            size="sm"
                            className="bg-white text-violet-600 hover:bg-white/90 border-none"
                        >
                            Try On
                        </Button>
                    </div>
                )}

                <div className="mb-8">
                    <h3 className="font-bold text-slate-900 mb-3">Select Size</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {sizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${selectedSize === size
                                    ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        {product.description}
                    </p>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 px-6 pb-safe flex gap-4 z-20 max-w-[480px] mx-auto">
                <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={() => addItem({ ...product, size: selectedSize })}
                >
                    <ShoppingBag size={20} />
                    Add to Cart
                </Button>
                <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                    Buy Now
                </Button>
            </div>
        </div>
    );
};
