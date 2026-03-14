import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AnimatePresence, motion } from 'framer-motion';

export const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center">
            {/* Mobile container - Simulates a phone on desktop */}
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative flex flex-col">

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 bg-slate-50 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 w-full max-w-[480px] z-50">
                    <Navbar />
                </div>
            </div>
        </div>
    );
};
