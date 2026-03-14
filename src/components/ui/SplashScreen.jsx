import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const SplashScreen = ({ onComplete }) => {
    const [animationState, setAnimationState] = useState('initial');

    useEffect(() => {
        // Start animation sequence
        const timer1 = setTimeout(() => setAnimationState('scaling'), 100);
        const timer2 = setTimeout(() => setAnimationState('fading'), 2000);
        const timer3 = setTimeout(() => onComplete(), 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${animationState === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`flex flex-col items-center transition-all duration-1000 ease-out transform ${animationState === 'initial' ? 'scale-90 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}>
                <Logo className="w-32 h-32" />
                <h1 className="mt-6 text-4xl font-black tracking-tighter text-slate-900 animate-pulse">
                    Virtu<span className="text-pink-600">Fit</span>
                </h1>

                {/* Minimal loading indicator */}
                <div className="mt-12 flex gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
                </div>
            </div>

            <div className="absolute bottom-10 text-slate-300 text-xs font-bold tracking-widest uppercase">
                Future of Fashion
            </div>
        </div>
    );
};
