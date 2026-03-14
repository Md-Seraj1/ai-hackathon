import React from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentMethods = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Payment Methods</h1>
            </header>

            <main className="flex-1 p-5 flex flex-col gap-6">
                {/* Primary Payment Method */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Primary Method</h2>
                            <p className="text-xs text-slate-400 font-medium">Used for all transactions</p>
                        </div>
                        <CheckCircle2 size={24} className="text-blue-600" />
                    </div>

                    <div className="bg-gradient-to-br from-[#41a124] to-[#368b1e] p-6 rounded-2xl text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="bg-white p-2 rounded-lg">
                                    <span className="text-[#41a124] font-black italic text-xl">eSewa</span>
                                </div>
                                <ShieldCheck size={24} className="text-white/80" />
                            </div>
                            <div className="mb-6">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-1">Payment Wallet</p>
                                <p className="text-lg font-bold">eSewa Mobile Wallet</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] items-center flex gap-1 font-bold text-white/80">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    CONNECTED
                                </p>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=esewa-payment" className="w-10 h-10 bg-white p-1 rounded-md opacity-20" alt="" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Payment Information</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium pt-1">
                                We exclusively use <strong className="text-slate-900">eSewa</strong> for all local transactions to ensure the highest security for our customers.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                <CreditCard size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-600 leading-relaxed font-medium pt-1">
                                    During checkout, you will be redirected to the secure eSewa login page.
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">NO CARD DATA IS EVER STORED LOCALLY</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto py-10 text-center">
                    <p className="text-xs text-slate-400 font-medium">Verified Merchant Account</p>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">TryOnMe Mobile App</p>
                </div>
            </main>
        </div>
    );
};
