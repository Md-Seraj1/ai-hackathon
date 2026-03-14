// Update 2
// Update 1
import React from 'react';
import { useCartStore } from '../lib/store';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const Cart = () => {
    const { items, removeItem, updateQuantity, total } = useCartStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-white p-4 flex items-center gap-4 sticky top-0 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold">Shopping Cart</h1>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <ShoppingBag size={32} className="text-slate-300" />
                    </div>
                    <p>Your cart is empty.</p>
                    <Button onClick={() => navigate('/')} variant="primary">Start Shopping</Button>
                </div>
            ) : (
                <div className="p-4 flex flex-col gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm border border-slate-100">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                                    <p className="text-xs text-slate-500">{item.brand}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="font-bold text-blue-600">Rs{item.price}</p>
                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-sm font-bold active:scale-90"
                                        >-</button>
                                        <span className="text-xs font-semibold w-3 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-sm font-bold active:scale-90"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-slate-300 hover:text-red-500 self-start"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                        <div className="mt-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between mb-2 text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>Rs{total().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-sm text-slate-600">
                            <span>Tax (5%)</span>
                            <span>Rs{(total() * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-100 my-4"></div>
                        <div className="flex justify-between mb-6 text-lg font-bold text-slate-900">
                            <span>Total</span>
                            <span>Rs{(total() * 1.05).toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full h-12 text-lg shadow-blue-200 shadow-xl"
                            onClick={() => navigate('/checkout')}
                        >
                            Checkout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple icon for empty state
// Omitted previous import here as it was moved to top
