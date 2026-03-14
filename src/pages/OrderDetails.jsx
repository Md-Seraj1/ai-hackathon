import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, CreditCard, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../lib/store';
import { format } from 'date-fns';

export const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && id) {
            fetchOrderDetails();
        }
    }, [user, id]);

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        product_variants (
                            *,
                            products (*)
                        )
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Order Details</h1>
            </header>

            <main className="flex-1 p-5 lg:max-w-xl lg:mx-auto w-full flex flex-col gap-6">
                {/* Order Summary Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Order Status</p>
                            <h2 className="text-lg font-bold text-slate-900">{order.status}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Order Date</p>
                            <p className="font-bold text-slate-900">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Package size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Order ID</p>
                                <p className="font-medium text-slate-900">#{order.id.toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <CreditCard size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Payment Method</p>
                                <p className="font-medium text-slate-900">eSewa Mobile Wallet</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Ordered Products</h3>
                    <div className="flex flex-col gap-6">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                                    <img
                                        src={item.product_variants.image_url || item.product_variants.products.image}
                                        alt={item.product_variants.products.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 h-20 flex flex-col justify-between py-1">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.product_variants.products.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity} • Size: {item.product_variants.size}</p>
                                    </div>
                                    <p className="font-bold text-slate-900">Rs{item.price_at_purchase}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-center">Payment Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>Subtotal</span>
                            <span>Rs{order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>Shipping</span>
                            <span className="text-blue-600">Free</span>
                        </div>
                        <div className="h-px bg-slate-50 my-2"></div>
                        <div className="flex justify-between text-lg font-bold text-slate-900">
                            <span>Total</span>
                            <span>Rs{order.total_amount}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle size={16} className="text-emerald-600" />
                        </div>
                        <p className="text-xs font-medium text-emerald-800 leading-relaxed pt-1">
                            Your payment has been processed securely via eSewa. You will receive a text confirmation shortly.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};
