import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const variants = {
        primary: 'bg-black text-white hover:bg-neutral-800 shadow-sm',
        secondary: 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 shadow-sm',
        accent: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        ghost: 'hover:bg-neutral-100 text-neutral-600',
        link: 'text-blue-600 underline-offset-4 hover:underline',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
});
Button.displayName = "Button";
