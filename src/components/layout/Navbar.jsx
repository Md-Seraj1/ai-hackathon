// Update 1
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../lib/store';

export const Navbar = () => {
    const cartItems = useCartStore((state) => state.items) || [];
    const cartCount = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0;

    return (
        <nav className="bg-white border-t border-slate-100 pb-safe pt-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <ul className="flex items-end justify-around">
                <li className="w-full">
                    <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative", isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                        <div className="relative">
                            <Home size={24} />
                        </div>
                        <span className="text-[10px] font-medium">Home</span>
                    </NavLink>
                </li>
                <li className="w-full">
                    <NavLink to="/search" className={({ isActive }) => cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative", isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                        <div className="relative">
                            <Search size={24} />
                        </div>
                        <span className="text-[10px] font-medium">Search</span>
                    </NavLink>
                </li>
                <li className="w-full">
                    <NavLink to="/try-on" className={({ isActive }) => cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative -mt-6", isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg shadow-blue-200 transform hover:scale-105 transition-transform">
                            <Camera size={24} className="text-white" />
                        </div>
                    </NavLink>
                </li>
                <li className="w-full">
                    <NavLink to="/cart" className={({ isActive }) => cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative", isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                        <div className="relative">
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Cart</span>
                    </NavLink>
                </li>
                <li className="w-full">
                    <NavLink to="/profile" className={({ isActive }) => cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative", isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                        <div className="relative">
                            <User size={24} />
                        </div>
                        <span className="text-[10px] font-medium">Profile</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};
