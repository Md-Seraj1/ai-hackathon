// Update 3
// Update 2
// Update 1
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, User as UserIcon, Mail, Calendar, Hash, ShoppingBag, ShieldAlert, Ban, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [actionUser, setActionUser] = useState(null); // { user, type: 'block' | 'reset' }
    const [isActionLoading, setIsActionLoading] = useState(false);
    const pageSize = 12;

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;

            // For each user, fetch their order count
            const usersWithStats = await Promise.all((data || []).map(async (user) => {
                const { count: orderCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                return { ...user, orderCount: orderCount || 0 };
            }));

            setUsers(usersWithStats);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockUser = async () => {
        if (!actionUser) return;
        setIsActionLoading(true);
        try {
            const newStatus = !actionUser.user.is_suspended;
            const { error } = await supabase.rpc('toggle_user_suspension', {
                target_user_id: actionUser.user.id,
                suspend_status: newStatus
            });

            if (error) {
                if (error.message.includes('Access denied')) {
                    throw new Error('Access Denied. You must be an Administrator to perform this action.');
                }
                throw error;
            }

            // Update local state immediately
            setUsers(prev => prev.map(u => u.id === actionUser.user.id ? { ...u, is_suspended: newStatus } : u));

            // Optional: Re-fetch for consistency
            // fetchUsers(); 
        } catch (error) {
            console.error('Error blocking user:', error);
            alert(`Failed: ${error.message}`);
        } finally {
            setIsActionLoading(false);
            setActionUser(null);
        }
    };

    const handleResetSession = async () => {
        if (!actionUser) return;
        setIsActionLoading(true);
        try {
            const { error } = await supabase.rpc('terminate_user_sessions', {
                target_user_id: actionUser.user.id
            });

            if (error) {
                if (error.message.includes('Access denied')) {
                    throw new Error('Access Denied. You must be an Administrator to perform this action.');
                }
                throw error;
            }

            alert(`Success! All active sessions for ${actionUser.user.full_name} have been terminated.`);
        } catch (error) {
            console.error('Error resetting session:', error);
            alert(`Failed to reset session: ${error.message}`);
        } finally {
            setIsActionLoading(false);
            setActionUser(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                <p className="text-slate-500 text-sm">View and manage your customer list and their activity.</p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-400">Loading customers...</div>
                ) : users.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">No customers found.</div>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className={`bg-white rounded-[32px] shadow-sm border overflow-hidden hover:border-blue-100 transition-all group ${user.is_suspended ? 'border-red-100 ring-2 ring-red-50' : 'border-slate-100'}`}>
                            <div className={`h-20 relative ${user.is_suspended ? 'bg-red-50' : 'bg-slate-50'}`}>
                                <div className="absolute top-4 right-4">
                                    {user.is_suspended ? (
                                        <div className="bg-red-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                                            <Ban size={10} /> Blocked
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <CheckCircle2 size={10} /> Active
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-10 left-6">
                                    <div className={`w-20 h-20 rounded-[28px] bg-white p-1 shadow-lg border ${user.is_suspended ? 'border-red-100' : 'border-slate-50'}`}>
                                        <img
                                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                            alt={user.full_name}
                                            className={`w-full h-full object-cover rounded-[24px] ${user.is_suspended ? 'grayscale' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 p-6 space-y-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{user.full_name || 'Anonymous User'}</h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5" title={user.email}>
                                        <Mail size={12} />
                                        <span className="truncate max-w-[180px]">{user.email || 'No email provided'}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <ShoppingBag size={10} /> Orders
                                        </p>
                                        <p className="text-sm font-black text-slate-900">{user.orderCount}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Calendar size={10} /> Joined
                                        </p>
                                        <p className="text-sm font-black text-slate-900 leading-tight">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Hash size={10} /> User ID
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-300 break-all line-clamp-1">{user.id}</p>
                                </div>

                                {/* Admin Actions */}
                                <div className="flex gap-2 pt-2 border-t border-slate-50">
                                    <button
                                        onClick={() => setActionUser({ user, type: 'block' })}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${user.is_suspended
                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                                            : 'bg-slate-50 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100'}`}
                                    >
                                        {user.is_suspended ? 'Unblock' : 'Block'}
                                    </button>
                                    <button
                                        onClick={() => setActionUser({ user, type: 'reset' })}
                                        className="flex-1 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors border border-transparent hover:border-slate-200"
                                    >
                                        Reset Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 pt-8 pb-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="flex items-center gap-2 px-6 h-12 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                    <ChevronLeft size={18} />
                    <span>Prev</span>
                </button>
                <span className="font-bold text-slate-400">Page {page}</span>
                <button
                    disabled={users.length < pageSize}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-6 h-12 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                    <span>Next</span>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Confirmation Modal */}
            {actionUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isActionLoading && setActionUser(null)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden transform transition-all p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${actionUser.type === 'block' && !actionUser.user.is_suspended ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {actionUser.type === 'block' ? <ShieldAlert size={24} /> : <LogOut size={24} />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                            {actionUser.type === 'block'
                                ? (actionUser.user.is_suspended ? 'Unblock Access?' : 'Block Access?')
                                : 'Terminate Sessions?'}
                        </h3>
                        <p className="text-slate-500 text-center text-sm mb-6 max-w-[260px] mx-auto leading-relaxed">
                            {actionUser.type === 'block'
                                ? (actionUser.user.is_suspended
                                    ? `Restore access for ${actionUser.user.full_name}? They will be able to sign in immediately.`
                                    : `Are you sure you want to block ${actionUser.user.full_name}? This will block login on all devices.`)
                                : `This will instantly sign out ${actionUser.user.full_name} from all active devices.`}
                        </p>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border-none"
                                onClick={() => setActionUser(null)}
                                disabled={isActionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={`flex-1 border-none text-white shadow-lg ${actionUser.type === 'block' && !actionUser.user.is_suspended
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                    }`}
                                onClick={actionUser.type === 'block' ? handleBlockUser : handleResetSession}
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <span>Confirm</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
