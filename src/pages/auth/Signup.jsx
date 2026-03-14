// Update 2
// Update 1
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import { Logo } from '../../components/ui/Logo';

export const Signup = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (data) => {
        if (!isSupabaseConfigured) {
            setError("❌ Supabase connection missing! Please check .env file.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Register user with Supabase
            // The handle_new_user trigger in Postgres will automatically create the profile row
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                    },
                },
            });

            if (authError) throw authError;

            // If email confirmation is enabled, user might not be logged in yet
            if (authData.session) {
                navigate('/');
            } else {
                // If session is null, it means email verification is required or auto-login is off
                alert('Account created! Please check your email/login.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.message);
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
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="mb-6 text-center">
                    <Logo className="w-20 h-20 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
                    <p className="text-slate-500 text-sm">Start your style journey today</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 ml-1">FULL NAME</label>
                        <input
                            {...register('fullName', { required: 'Name is required' })}
                            type="text"
                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                            placeholder="John Doe"
                        />
                        {errors.fullName && <p className="text-red-500 text-xs ml-1">{errors.fullName.message}</p>}
                    </div>

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
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                            type="password"
                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                    </div>

                    <div className="flex items-center gap-3 my-2 bg-slate-50 p-3 rounded-xl">
                        <input type="checkbox" required className="accent-blue-600 w-5 h-5 rounded cursor-pointer" />
                        <span className="text-xs text-slate-500 font-medium leading-tight">
                            I agree to the <a href="#" className="underline text-slate-900">Terms</a> and <a href="#" className="underline text-slate-900">Privacy Policy</a>
                        </span>
                    </div>

                    <Button disabled={loading} className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 rounded-xl mt-2">
                        {loading ? 'Creating Account...' : 'Sign Up'}
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
                    Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Log in</Link>
                </p>
            </div>
        </div>
    );
};
