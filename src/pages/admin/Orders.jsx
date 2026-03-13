// Update 3
// Update 2
// Update 1
import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        fetchOrders();
    }, [page, searchTerm]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select('*, profiles(full_name, avatar_url)', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`id.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateTracking = async (orderId, trackingNumber) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ tracking_number: trackingNumber })
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders();
            alert('Tracking number updated!');
        } catch (error) {
            alert(error.message);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                <p className="text-slate-500 text-sm">Manage customer orders, shipping, and status updates.</p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading orders...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No orders found.</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-white transition-colors">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">#{order.id.slice(0, 8)}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{order.profiles?.full_name || 'Guest'}</p>
                                            <p className="text-xs text-slate-500">{order.payment_status}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">Rs {Number(order.total_amount).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">Page {page}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-slate-200 rounded-xl disabled:opacity-50"><ChevronLeft size={18} /></button>
                        <button disabled={orders.length < pageSize} onClick={() => setPage(p => p + 1)} className="p-2 border border-slate-200 rounded-xl disabled:opacity-50"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
                                <p className="text-slate-400 text-xs font-bold">#{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><XCircle size={24} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-widest mb-1">Status</p>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="text-3xl font-black text-slate-900">Rs {Number(selectedOrder.total_amount).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Tracking Number */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-900 ml-1 flex items-center gap-2">
                                    <Truck size={14} className="text-blue-600" />
                                    TRACKING NUMBER
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter tracking number..."
                                        defaultValue={selectedOrder.tracking_number}
                                        onBlur={(e) => handleUpdateTracking(selectedOrder.id, e.target.value)}
                                        className="flex-1 h-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                                    />
                                    <Button className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-bold">Update</Button>
                                </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                        <MapPin size={12} className="text-blue-600" />
                                        Shipping Address
                                    </h4>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-bold text-slate-900">{selectedOrder.shipping_address?.fullName}</p>
                                        <p>{selectedOrder.shipping_address?.address}</p>
                                        <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                                        <p>{selectedOrder.shipping_address?.zipCode}</p>
                                        <p className="pt-2 font-mono text-xs">{selectedOrder.shipping_address?.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                        <Calendar size={12} className="text-blue-600" />
                                        Timeline
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0 shadow-lg shadow-blue-500/50"></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Order Placed</p>
                                                <p className="text-[10px] text-slate-400">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0"></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400">Marked as {selectedOrder.status}</p>
                                                <p className="text-[10px] text-slate-300">Just now</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full h-14 bg-slate-50 text-slate-600 font-bold rounded-[20px] border border-slate-200 hover:bg-slate-100 transition-all mt-4"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
