import React, { useEffect, useState } from 'react';
import {
    User, Settings, Package, Heart, LogOut, ChevronRight,
    CreditCard, Mail, Edit2, MapPin,
    LayoutDashboard, Shield
} from 'lucide-react';
import { useUserStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { user, profile, logout, isAdmin } = useUserStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ orders: 0, reviews: 0 });

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const { count: ordersCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: reviewsCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setStats({
                orders: ordersCount || 0,
                reviews: reviewsCount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
        navigate('/login');
    };

    const menuItems = [
        ...(isAdmin ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }] : []),
        { icon: Package, label: 'My Orders', badge: stats.orders > 0 ? String(stats.orders) : null, path: '/orders' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' },
        { icon: CreditCard, label: 'Payment Methods', path: '/payments' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full opacity-50 -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute top-0 left-0 p-24 bg-purple-50 rounded-full opacity-50 -ml-12 -mt-12 blur-2xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-xl mb-4 overflow-hidden relative">
                        <img
                            src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <button className="absolute bottom-0 right-0 left-0 bg-black/50 p-1 flex justify-center backdrop-blur-sm">
                            <Edit2 size={12} className="text-white" />
                        </button>
                    </div>
                    {/* Only show Full Name, fallback to "User", NEVER show email */}
                    <h1 className="text-xl font-bold text-slate-900">{profile?.full_name || 'User'}</h1>

                    <div className="flex gap-4 w-full justify-center mt-6">
                        <div className="text-center px-4">
                            <p className="font-bold text-lg text-slate-900">{stats.orders}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Orders</p>
                        </div>
                        <div className="w-px bg-slate-200 h-8 self-center"></div>
                        <div className="text-center px-4">
                            <p className="font-bold text-lg text-slate-900">{stats.reviews}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reviews</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Menu */}
            <div className="px-5 flex flex-col gap-3">
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => item.path && navigate(item.path)}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <item.icon size={20} />
                            </div>
                            <span className="font-medium text-slate-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                            )}
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400" />
                        </div>
                    </button>
                ))}

                <button onClick={handleLogout} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mt-4 text-red-500 hover:bg-red-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <LogOut size={20} />
                        <span className="font-medium">Log Out</span>
                    </div>
                </button>
            </div>

            <div className="text-center mt-8 text-xs text-slate-400">
                <p>App Version 1.0.0</p>
            </div>
        </div>
    );
};
