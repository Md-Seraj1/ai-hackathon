// Update 1
import React, { useMemo } from 'react';
import { ArrowLeft, ShieldCheck, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../lib/store';
import { Button } from '../components/ui/Button';

export const Checkout = () => {
    const navigate = useNavigate();
    const { items, total } = useCartStore();

    const { subtotal, tax, grandTotal } = useMemo(() => {
        const subtotalValue = total();
        const taxValue = subtotalValue * 0.05;
        const grandTotalValue = subtotalValue + taxValue;

        return {
            subtotal: subtotalValue.toFixed(2),
            tax: taxValue.toFixed(2),
            grandTotal: grandTotalValue.toFixed(2),
        };
    }, [total]);

    const handleEsewaPay = () => {
        if (items.length === 0) {
            return;
        }

        const pid = `TRYON-${Date.now()}`;
        const baseUrl =
            import.meta.env.VITE_ESEWA_BASE_URL || 'https://uat.esewa.com.np/epay/main';
        const merchantCode = import.meta.env.VITE_ESEWA_MERCHANT_CODE || 'EPAYTEST';

        const params = {
            amt: subtotal,
            psc: 0,
            pdc: 0,
            txAmt: tax,
            tAmt: grandTotal,
            pid,
            scd: merchantCode,
            su: `${window.location.origin}/payment/success?pid=${pid}`,
            fu: `${window.location.origin}/payment/failure?pid=${pid}`,
        };

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = baseUrl;

        Object.entries(params).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = String(key);
            input.value = String(value);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 bg-white sticky top-0 z-40 shadow-sm border-b border-slate-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600"
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
            </header>

            <main className="flex-1 p-5 flex flex-col gap-5 lg:max-w-xl lg:mx-auto w-full">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                        Order Summary
                    </h2>
                    {items.length === 0 ? (
                        <p className="text-sm text-slate-500">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-48 overflow-y-auto flex flex-col gap-3 pr-1">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-semibold text-slate-900 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-900">
                                            Rs{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-slate-100 my-1" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>Rs{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax (5%)</span>
                                    <span>Rs{tax}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="text-blue-600 font-semibold">Free</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2" />
                                <div className="flex justify-between text-lg font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>Rs{grandTotal}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Method - eSewa */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Payment Method
                            </p>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600">
                                    <Wallet size={16} />
                                </span>
                                eSewa Mobile Wallet
                            </h2>
                        </div>
                        <ShieldCheck size={22} className="text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        You will be securely redirected to the official eSewa payment page to complete
                        your purchase. No card or wallet credentials are stored in this app.
                    </p>

                    <Button
                        className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-[#41a124] to-[#368b1e] text-white shadow-emerald-200 shadow-lg hover:opacity-95 active:scale-95"
                        disabled={items.length === 0}
                        onClick={handleEsewaPay}
                    >
                        Pay with eSewa (Rs{grandTotal})
                    </Button>

                    {items.length === 0 && (
                        <p className="mt-2 text-[11px] text-slate-400 text-center">
                            Add items to your cart before proceeding to payment.
                        </p>
                    )}
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
                    By proceeding, you agree to be redirected to eSewa for payment. After successful
                    payment, you&apos;ll be brought back to this app with your payment status.
                </p>
            </main>
        </div>
    );
};

