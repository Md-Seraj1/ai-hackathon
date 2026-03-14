// Update 3
// Update 2
// Update 1
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, LogOut, Shield, ChevronRight, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../lib/store';
import { Button } from '../components/ui/Button';

export const Settings = () => {
    const navigate = useNavigate();
    const { user, profile, setProfile, logout } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhoneNumber(profile.phone_number || '');
        }
    }, [profile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone_number: phoneNumber,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local store
            setProfile({ ...profile, full_name: fullName, phone_number: phoneNumber });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 bg-white sticky top-0 z-40 border-b border-slate-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Settings</h1>
            </header>

            <main className="flex-1 p-5 flex flex-col gap-6">
                {/* Profile Settings */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Profile Information</h2>
                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-900 ml-1">FULL NAME</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-900 ml-1">PHONE NUMBER</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                                    placeholder="e.g. +977 98XXXXXXXX"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <p className={`text-xs font-bold text-center ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {message.text}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 w-full bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800"
                        >
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </form>
                </section>

                {/* Additional Options */}
                <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                    <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Moon size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900">Dark Mode</p>
                                <p className="text-[10px] text-slate-400">Reduce screen glare</p>
                            </div>
                        </div>
                        <div className="w-10 h-6 bg-slate-200 rounded-full relative p-1 transition-colors">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </button>

                    <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <Shield size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900">Privacy Policy</p>
                                <p className="text-[10px] text-slate-400">Manage your data</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                    </button>
                </section>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors mt-4 shadow-sm"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </main>
        </div>
    );
};
