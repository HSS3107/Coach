import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate(); // Hook for navigation
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setMsg({ type: 'error', text: 'Please enter both email and password.' });
            return;
        }

        setLoading(true);
        setMsg(null);

        try {
            if (mode === 'signin') {
                await signIn(email, password);
                navigate('/'); // Redirect to Home/Dashboard
            } else {
                await signUp(email, password);
                navigate('/'); // Redirect to Home/Dashboard (Auto-login enabled)
            }
        } catch (error: any) {
            console.log("Login Error Caught:", error);
            console.log("Error Message:", error.message);

            if (mode === 'signin' && error.message?.includes('Invalid login credentials')) {
                setMsg({ type: 'error', text: 'Invalid email or password.' });
            } else if (mode === 'signup' && error.message?.includes('User already registered')) {
                setMsg({ type: 'error', text: 'Account already exists. Please Sign In instead.' });
                // Optional: automatically switch to sign in mode?
                // setMode('signin'); 
            } else {
                setMsg({ type: 'error', text: error.message || 'Authentication failed' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-3xl font-extrabold text-text-primary">
                    Coach AI
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                    Your personal health & wellness companion
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-bg-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-bg-tertiary">
                    {/* Tabs */}
                    <div className="flex border-b border-bg-tertiary mb-6">
                        <button
                            className={clsx(
                                "flex-1 pb-2 text-center font-medium text-sm transition-colors relative",
                                mode === 'signin' ? "text-accent-primary" : "text-text-tertiary hover:text-text-secondary"
                            )}
                            onClick={() => { setMode('signin'); setMsg(null); }}
                        >
                            Sign In
                            {mode === 'signin' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary" />}
                        </button>
                        <button
                            className={clsx(
                                "flex-1 pb-2 text-center font-medium text-sm transition-colors relative",
                                mode === 'signup' ? "text-accent-primary" : "text-text-tertiary hover:text-text-secondary"
                            )}
                            onClick={() => { setMode('signup'); setMsg(null); }}
                        >
                            Sign Up
                            {mode === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary" />}
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder='you@example.com'
                                    className="input w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={mode === 'signin' ? "current-password" : "new-password"}
                                    required
                                    placeholder='••••••••'
                                    className="input w-full pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-text-tertiary hover:text-text-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {msg && (
                            <div className={clsx(
                                "p-3 rounded-md text-sm",
                                msg.type === 'error' ? "bg-red-900/20 text-red-200" : "bg-green-900/20 text-green-200"
                            )}>
                                {msg.text}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
