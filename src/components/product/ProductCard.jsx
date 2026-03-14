// Update 3
// Update 2
// Update 1
import React, { useState } from 'react';
import { Star, Plus, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useUserStore } from '../../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const addItem = useCartStore((state) => state.addItem);
    const { user, wishlist, toggleWishlist } = useUserStore();
    const [isToggling, setIsToggling] = useState(false);

    const isInWishlist = wishlist.includes(product.id);

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        if (isToggling) return;

        setIsToggling(true);
        // Optimistic Update
        toggleWishlist(product.id);

        try {
            if (isInWishlist) {
                // Remove from wishlist
                const { error } = await supabase
                    .from('wishlists')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', product.id);
                if (error) throw error;
            } else {
                // Add to wishlist
                const { error } = await supabase
                    .from('wishlists')
                    .insert({ user_id: user.id, product_id: product.id });
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            // Revert on error
            toggleWishlist(product.id);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 relative group"
        >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                </Link>

                {/* Wishlist Heart Button */}
                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm z-10 transition-transform active:scale-90"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isInWishlist ? 'filled' : 'empty'}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Heart
                                size={18}
                                className={isInWishlist ? "fill-red-500 text-red-500" : "text-slate-400"}
                            />
                        </motion.div>
                    </AnimatePresence>
                </button>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem(product);
                    }}
                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-slate-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 z-10"
                >
                    <Plus size={20} />
                </button>
            </div>

            <Link to={`/product/${product.id}`} className="block">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                        {product.brand}
                    </span>
                    <div className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-slate-600">{product.rating}</span>
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 leading-tight">{product.name}</h3>
                <p className="text-blue-600 font-bold mt-1 text-sm">Rs{product.price.toFixed(2)}</p>
            </Link>
        </motion.div>
    );
};
