// Update 1
import React from 'react';

export const Logo = ({ className = "w-20 h-20", showText = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative">
                {/* Shopping Bag Base */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                    {/* Bag Body */}
                    <path
                        d="M25 35 L75 35 L80 85 Q80 90 75 90 L25 90 Q20 90 20 85 L25 35"
                        fill="white"
                        stroke="#E2E8F0"
                        strokeWidth="1"
                    />
                    {/* Bag Handle */}
                    <path
                        d="M35 35 Q35 15 50 15 Q65 15 65 35"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* The "V" */}
                    <path
                        d="M38 55 L50 72 L62 55"
                        fill="none"
                        stroke="#EC4899"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Stylized Figure Leaping Out */}
                    <g transform="translate(65, 30) rotate(-15)">
                        <circle cx="10" cy="0" r="4" fill="#F43F5E" />
                        <path
                            d="M10 5 Q15 15 5 25 Q15 20 20 10"
                            fill="#F43F5E"
                            stroke="#F43F5E"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Accent Bubbles */}
                    <circle cx="78" cy="25" r="2" fill="#FB7185" />
                    <circle cx="82" cy="35" r="1.5" fill="#FDA4AF" />
                </svg>
            </div>
            {showText && (
                <span className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    Virtu<span className="text-pink-500">Fit</span>
                </span>
            )}
        </div>
    );
};
