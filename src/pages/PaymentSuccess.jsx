// Update 3
// Update 2
// Update 1
import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowLeft, PartyPopper } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useCartStore, useUserStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pid = searchParams.get('pid');
    const refId = searchParams.get('refId');
    const { items, clearCart, total } = useCartStore();
    const { user, profile } = useUserStore();
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const createOrderIfNeeded = async () => {
            if (!pid || !user || items.length === 0 || isCreatingOrder || orderId) {
                return;
            }

            setIsCreatingOrder(true);
            setErrorMessage('');

            try {
                // 1) Check if we already created an order for this payment (idempotent)
                const { data: existingOrder, error: checkError } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('payment_intent_id', pid)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (checkError) {
                    console.error('Error checking existing order:', checkError);
                }

                if (existingOrder) {
                    setOrderId(existingOrder.id);
                    setIsCreatingOrder(false);
                    return;
                }

                // 2) Calculate totals based on cart
                const subtotal = total();
                const tax = subtotal * 0.05;
                const grandTotal = subtotal + tax;

                // 3) Basic placeholder shipping address (no address UI yet)
                const shippingAddress = {
                    full_name: profile?.full_name || 'Customer',
                    line1: 'Address not provided',
                    city: profile?.city || 'Unknown',
                    country: 'NP',
                };

                // 4) Create order row
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        user_id: user.id,
                        status: 'Processing',
                        total_amount: grandTotal.toFixed(2),
                        payment_status: 'Paid',
                        shipping_address: shippingAddress,
                        payment_intent_id: pid,
                    })
                    .select('*')
                    .single();

                if (orderError) {
                    console.error('Error creating order:', orderError);
                    setErrorMessage('We received your payment, but could not create the order record. Please contact support.');
                    setIsCreatingOrder(false);
                    return;
                }

                // 5) Create order_items for each cart item
                const itemsToInsert = [];

                for (const item of items) {
                    // Find a matching product_variant by product_id and size (if any)
                    const size = item.size || 'M';

                    const { data: variant, error: variantError } = await supabase
                        .from('product_variants')
                        .select('id')
                        .eq('product_id', item.id)
                        .eq('size', size)
                        .maybeSingle();

                    if (variantError) {
                        console.error('Error fetching variant for item', item.id, variantError);
                        continue;
                    }

                    if (!variant) {
                        console.warn('No variant found for product', item.id, 'size', size);
                        continue;
                    }

                    itemsToInsert.push({
                        order_id: order.id,
                        product_variant_id: variant.id,
                        quantity: item.quantity,
                        price_at_purchase: item.price,
                    });
                }

                if (itemsToInsert.length > 0) {
                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(itemsToInsert);

                    if (itemsError) {
                        console.error('Error inserting order items:', itemsError);
                        setErrorMessage('Your order was created but some items could not be saved. Please contact support.');
                    }
                }

                // 6) Clear cart and store created order id
                clearCart();
                setOrderId(order.id);
            } catch (err) {
                console.error('Unexpected error creating order:', err);
                setErrorMessage('Something went wrong while creating your order. Please contact support.');
            } finally {
                setIsCreatingOrder(false);
            }
        };

        createOrderIfNeeded();
    }, [pid, user, items, total, clearCart, profile, isCreatingOrder, orderId]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-sm text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={34} />
                    </div>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Successful</h1>
                <p className="text-sm text-slate-500 mb-4">
                    Thank you for your purchase! Your eSewa payment has been completed and we&apos;re creating your order.
                </p>

                {pid && (
                    <p className="text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-600">Payment ID:</span> {pid}
                    </p>
                )}
                {refId && (
                    <p className="text-[11px] text-slate-400 mb-4">
                        <span className="font-semibold text-slate-600">Reference:</span> {refId}
                    </p>
                )}

                {isCreatingOrder && (
                    <p className="text-[11px] text-blue-500 mb-3">
                        Finalizing your order, please wait...
                    </p>
                )}

                {orderId && !isCreatingOrder && (
                    <p className="text-[11px] text-emerald-600 mb-3">
                        Your order has been created successfully. Order ID: {orderId.slice(0, 8).toUpperCase()}
                    </p>
                )}

                {errorMessage && (
                    <p className="text-[11px] text-red-500 mb-3">
                        {errorMessage}
                    </p>
                )}

                <Button
                    className="w-full h-11 mb-3 flex items-center justify-center gap-2"
                    onClick={() => navigate('/orders')}
                >
                    <PartyPopper size={18} />
                    View My Orders
                </Button>
                <button
                    className="w-full h-10 text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 hover:text-slate-700"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft size={14} />
                    Continue Shopping
                </button>

                <p className="mt-4 text-[10px] text-slate-400 leading-relaxed">
                    Note: For full production use, you should verify the transaction with eSewa on the
                    server and update the order status accordingly.
                </p>
            </div>
        </div>
    );
};

