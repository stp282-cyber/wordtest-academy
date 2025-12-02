import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen w-full bg-bg flex items-center justify-center p-4 relative overflow-hidden pattern-grid-lg">
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-warning border-2 border-black shadow-neo rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary border-2 border-black shadow-neo rotate-12" />
            <div className="absolute top-1/2 left-[-50px] w-40 h-40 bg-accent border-2 border-black rounded-full mix-blend-multiply opacity-20" />

            <div className="w-full max-w-md z-10 relative">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-display font-black text-black mb-2 tracking-tighter italic">
                        WORD<span className="text-primary">TEST</span>
                    </h1>
                    <div className="inline-block bg-black text-white px-3 py-1 font-mono text-sm font-bold transform -rotate-2">
                        PREMIUM LEARNING PLATFORM
                    </div>
                </div>

                <Outlet />

                <div className="mt-8 text-center text-sm font-bold text-slate-500 font-mono">
                    &copy; {new Date().getFullYear()} WordTest Academy.
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
