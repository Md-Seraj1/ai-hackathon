// Update 3
// Update 2
// Update 1
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Menu, Bell, User } from 'lucide-react';
import { useUserStore } from '../../lib/store';

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, profile } = useUserStore();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 lg:hidden text-slate-600 hover:bg-slate-50 rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                            Store Management
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600">
                        <button className="p-2 hover:bg-slate-50 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{profile?.full_name || 'Admin'}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Administrator</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                                <img
                                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                    alt="Admin"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
