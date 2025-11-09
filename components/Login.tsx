import React, { useState } from 'react';
import Logo from './Logo';
import GoogleIcon from './icons/GoogleIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = () => {
        setIsLoggingIn(true);
        setTimeout(() => {
            onLoginSuccess();
        }, 1500); // Simulate network delay
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-sm w-full text-center">
                <Logo className="h-20 w-auto mx-auto" />
                <h1 className="text-3xl font-bold text-slate-800 mt-6">Welcome to Stroll Path</h1>
                <p className="text-slate-600 mt-2">Discover, create, and share your favorite walking paths.</p>
                <div className="mt-12">
                    <button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-slate-100 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isLoggingIn ? (
                            <>
                                <SpinnerIcon className="w-6 h-6 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <GoogleIcon className="w-6 h-6" />
                                Sign in with Google
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;