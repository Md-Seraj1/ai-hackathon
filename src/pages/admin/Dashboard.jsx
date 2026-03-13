import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingBag,
    Users as UsersIcon,
    Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        recentOrders: [],
        isLoading: true
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Total Orders
                const { count: ordersCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true });

                // Fetch Total Sales
                const { data: salesData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .eq('payment_status', 'Paid');

                const totalSales = salesData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

                // Fetch Total Users
                const { count: usersCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // Fetch Recent Orders
                const { data: recentOrders } = await supabase
                    .from('orders')
                    .select('*, profiles(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(5);

                setStats({
                    totalSales,
                    totalOrders: ordersCount || 0,
                    totalUsers: usersCount || 0,
                    recentOrders: recentOrders || [],
                    isLoading: false
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `Rs ${stats.totalSales.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
        { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.2%' },
        { label: 'Total Customers', value: stats.totalUsers.toString(), icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+18.4%' },
    ];

    if (stats.isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 text-sm">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Clock size={18} className="text-blue-600" />
                            Recent Orders
                        </h3>
                        <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">#{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{order.profiles?.full_name || 'Guest User'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">Rs {Number(order.total_amount).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
