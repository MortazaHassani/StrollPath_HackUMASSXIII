import React from 'react';
import Logo from './Logo';

interface WelcomeScreenProps {
    username: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username }) => {
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex flex-col justify-center items-center animate-fade-in-out">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                <Logo className="h-16 w-auto mx-auto" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-6">
                    Welcome back, {username}!
                </h1>
                <p className="text-slate-600 mt-2">Let's find your next favorite path.</p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
