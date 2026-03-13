// Update 3
// Update 2
// Update 1
import React, { useState, useEffect } from 'react';
import {
    Star,
    Search,
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export const Ratings = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        fetchReviews();
    }, [page, searchTerm]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('reviews')
                .select('*, profiles(full_name, avatar_url), products(name, brand)', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`comment.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleApproval = async (reviewId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ is_approved: !currentStatus })
                .eq('id', reviewId);

            if (error) throw error;
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: !currentStatus } : r));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete this review permanently?')) return;
        try {
            const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
            if (error) throw error;
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            alert(error.message);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Ratings & Reviews</h1>
                <p className="text-slate-500 text-sm">Moderate customer feedback and ensure a positive community.</p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search review content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-400">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">No reviews found.</div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className={`bg-white rounded-[32px] shadow-sm border transition-all flex flex-col ${review.is_approved ? 'border-slate-100' : 'border-amber-100 bg-amber-50/10'}`}>
                            <div className="p-6 flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                                            <img
                                                src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{review.profiles?.full_name || 'User'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{review.products?.name}</p>
                                    <p className="text-sm text-slate-600 italic line-clamp-3">"{review.comment}"</p>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    {!review.is_approved && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
                                            <AlertCircle size={10} /> Hidden
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleApproval(review.id, review.is_approved)}
                                        className={`p-2 rounded-xl transition-all ${review.is_approved ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                        title={review.is_approved ? 'Hide Review' : 'Approve Review'}
                                    >
                                        {review.is_approved ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
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
                    disabled={reviews.length < pageSize}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-6 h-12 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                    <span>Next</span>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};
