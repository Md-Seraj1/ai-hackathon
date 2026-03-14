// Update 2
// Update 1
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import { useUserStore } from '../../lib/store';
import { Logo } from '../../components/ui/Logo';

export const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const setUser = useUserStore((state) => state.setUser);

    // We don't need mock mode anymore
    // const isMockMode = !import.meta.env.VITE_SUPABASE_URL;

    const onSubmit = async (data) => {
        if (!isSupabaseConfigured) {
            setError("❌ Supabase connection missing! Please check .env file.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Attempt Sign In
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) throw authError;

            if (authData?.user) {
                // 2. Check Profile Status
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_suspended')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error("Profile check failed", profileError);
                }

                // 3. Enforce Block
                if (profile?.is_suspended) {
                    await supabase.auth.signOut();
                    throw new Error("Your account has been suspended. Please contact support.");
                }

                // Session is handled by App.jsx subscription, but we can set user immediately
                // to make the transition smoother
                setUser(authData.user);
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
            if (err.message.includes('suspended')) {
                await supabase.auth.signOut();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        if (!isSupabaseConfigured) {
            setError("❌ Supabase connection missing!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider.toLowerCase(),
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });

            if (error) throw error;
            // The redirect will happen automatically
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="mb-8 text-center">
                    <Logo className="w-20 h-20 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-500 text-sm">Sign in to continue shopping</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 ml-1">EMAIL</label>
                        <input
                            {...register('email', { required: 'Email is required' })}
                            type="email"
                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                            placeholder="hello@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 ml-1">PASSWORD</label>
                        <input
                            {...register('password', { required: 'Password is required' })}
                            type="password"
                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="text-blue-600 text-xs font-bold hover:underline">Forgot Password?</button>
                    </div>

                    <Button disabled={loading} className="w-full h-14 text-lg font-bold shadow-xl shadow-slate-200 bg-slate-900 hover:bg-slate-800 rounded-xl mt-2">
                        {loading ? 'Processing...' : 'Log In'}
                    </Button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                            <span className="px-2 bg-white text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            disabled={loading}
                            onClick={() => handleSocialLogin('Google')}
                            className="w-full flex items-center justify-center gap-3 h-14 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-base transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                </div>
                            ) : (
                                <>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                    Don't have an account? <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">Sign up</Link>
                </p>
            </div>
        </div>
    );
};
