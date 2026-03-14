// Update 3
// Update 2
// Update 1
import React from 'react';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const PaymentFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pid = searchParams.get('pid');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-sm text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <XCircle size={34} />
                    </div>
                </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h1>
                <p className="text-sm text-slate-500 mb-4">
                    Your eSewa payment could not be completed or was cancelled. No amount was charged.
                </p>

                {pid && (
                    <p className="text-[11px] text-slate-400 mb-4">
                        <span className="font-semibold text-slate-600">Payment ID:</span> {pid}
                    </p>
                )}

                <Button
                    className="w-full h-11 mb-3 flex items-center justify-center gap-2"
                    onClick={() => navigate('/checkout')}
                >
                    <RotateCcw size={18} />
                    Try Again
                </Button>
                <button
                    className="w-full h-10 text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 hover:text-slate-700"
                    onClick={() => navigate('/cart')}
                >
                    <ArrowLeft size={14} />
                    Back to Cart
                </button>

                <p className="mt-4 text-[10px] text-slate-400 leading-relaxed">
                    If this keeps happening, please check your eSewa wallet balance and network
                    connection, or try again later.
                </p>
            </div>
        </div>
    );
};

