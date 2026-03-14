import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    ListOrdered,
    Users,
    Menu,
    X,
    LogOut,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../lib/store';

export const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const logout = useUserStore(state => state.logout);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
        { icon: Sparkles, label: 'AI Try-On', path: '/admin/ai-try-on' },
        { icon: ListOrdered, label: 'Orders', path: '/admin/orders' },
        { icon: Users, label: 'Users', path: '/admin/users' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800">
                <div className="p-6">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-xl font-bold">A</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Admin Panel</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
                    >
                        <ExternalLink size={20} />
                        <span className="font-medium">View Store</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <Link to="/admin" className="flex items-center gap-3" onClick={toggleSidebar}>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl font-bold">A</span>
                        </div>
                        <span className="text-xl font-bold">Admin</span>
                    </Link>
                    <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            onClick={toggleSidebar}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-4 rounded-xl transition-all
                                ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800'}
                            `}
                        >
                            <item.icon size={20} />
                            <span className="font-bold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <Link
                        to="/"
                        onClick={toggleSidebar}
                        className="flex items-center gap-3 px-4 py-3 text-slate-400"
                    >
                        <ExternalLink size={20} />
                        <span className="font-medium">View Store</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-4 text-red-400 bg-red-500/5 rounded-xl"
                    >
                        <LogOut size={20} />
                        <span className="font-bold">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
