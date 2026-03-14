import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../lib/store';
import { format } from 'date-fns';

export const Orders = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
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
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} className="text-orange-500" />;
            case 'Processing': return <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
            case 'Shipped': return <Truck size={16} className="text-blue-500" />;
            case 'Delivered': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return <Package size={16} className="text-slate-500" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 bg-white sticky top-0 z-40 shadow-sm border-b border-slate-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">My Orders</h1>
            </header>

            <main className="flex-1 p-5 flex flex-col gap-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <Package size={32} className="text-slate-300" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-900 mb-1">No orders found</p>
                            <p className="text-sm">You haven't placed any orders yet.</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-2 text-blue-600 font-bold text-sm hover:underline"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    orders.map((order) => (
                        <button
                            key={order.id}
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors text-left"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Order ID</p>
                                    <p className="font-bold text-slate-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusStyles(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                            </div>

                            {/* Products Summary in List */}
                            <div className="flex flex-col gap-3 my-4">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                            <img
                                                src={item.product_variants.image_url || item.product_variants.products.image}
                                                alt={item.product_variants.products.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-slate-900 truncate">{item.product_variants.products.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} • Rs{item.price_at_purchase}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-1">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Order Date</p>
                                    <p className="font-medium text-slate-600 text-xs">
                                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Total Amount</p>
                                    <p className="font-bold text-slate-900">Rs{order.total_amount}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 text-blue-600 group">
                                <span className="text-xs font-bold">View Details</span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))
                )}
            </main>
        </div>
    );
};
