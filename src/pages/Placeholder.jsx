import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Placeholder = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white p-4 flex items-center gap-4 sticky top-0 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold">{title}</h1>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                    <span className="text-2xl">🚧</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h2>
                <p>The {title} feature is currently under development.</p>
            </div>
        </div>
    );
};
