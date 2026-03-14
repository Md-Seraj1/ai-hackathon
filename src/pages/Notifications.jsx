import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle, CreditCard, ShoppingBag, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';

export const Notifications = () => {
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            markAllRead();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
        } catch (error) {
            console.error('Error marking notifications read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingBag size={20} className="text-blue-600" />;
            case 'payment': return <CreditCard size={20} className="text-emerald-600" />;
            case 'system': return <Info size={20} className="text-amber-600" />;
            case 'promo': return <Bell size={20} className="text-purple-600" />;
            default: return <Bell size={20} className="text-slate-600" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'order': return 'bg-blue-50';
            case 'payment': return 'bg-emerald-50';
            case 'system': return 'bg-amber-50';
            case 'promo': return 'bg-purple-50';
            default: return 'bg-slate-50';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-50">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            </header>

            <div className="p-5 flex flex-col gap-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <Bell size={24} className="text-slate-300" />
                        </div>
                        <p className="font-medium">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`flex gap-4 p-4 rounded-2xl border ${notif.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/30 border-blue-100'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-bold mb-1 ${notif.is_read ? 'text-slate-900' : 'text-blue-900'}`}>{notif.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            {!notif.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
