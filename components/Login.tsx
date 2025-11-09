

import React, { useState } from 'react';
import Logo from './Logo';
import GoogleIcon from './icons/GoogleIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { signInWithGoogle, signInWithEmail, createUser } from '../services/firebase';

const Login: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await signInWithGoogle();
            // Auth state change is handled by onAuthStateChanged in App.tsx
        } catch (error) {
            console.error("Google sign-in error:", error);
            setError("Failed to sign in. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'register' && !name.trim()) {
            setError("Name is required for registration.");
            return;
        }
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            if (mode === 'login') {
                await signInWithEmail(email, password);
            } else {
                await createUser(name, email, password);
            }
            // onAuthStateChanged in App.tsx will handle successful login/registration
        } catch (err: any) {
            // Firebase provides helpful error messages, e.g., "auth/wrong-password"
            const friendlyMessage = err.message ? err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.$/, '') : "An unknown error occurred.";
            setError(friendlyMessage);
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'login' ? 'register' : 'login');
        setError(null);
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                    <Logo className="h-16 w-auto mx-auto" />
                    <h1 className="text-3xl font-bold text-slate-800 mt-4">Welcome to Stroll Path</h1>
                    <p className="text-slate-600 mt-1">
                        {mode === 'login' ? 'Sign in to continue' : 'Create an account to get started'}
                    </p>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                         {mode === 'register' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2"
                                    />
                                </div>
                            </div>
                        )}
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                             <button
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                <GoogleIcon className="w-6 h-6" />
                                <span>Google</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-600">
                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={toggleMode} className="font-medium text-amber-500 hover:text-amber-600 ml-1">
                        {mode === 'login' ? 'Register' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;