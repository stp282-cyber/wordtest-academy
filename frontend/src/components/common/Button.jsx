import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'neo-btn inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-blue-600',
        secondary: 'bg-white text-black hover:bg-slate-50',
        danger: 'bg-accent text-white hover:bg-rose-600',
        success: 'bg-success text-white hover:bg-green-600',
        ghost: 'bg-transparent border-transparent shadow-none hover:bg-slate-100' // Ghost might not have borders in this style, or maybe dashed? Keeping simple for now.
    };

    // Override ghost for specific neo-look if needed, but standard ghost is fine.
    // Actually, let's make ghost have no border/shadow by default but add hover effect.
    if (variant === 'ghost') {
        variants.ghost = 'bg-transparent border-0 shadow-none hover:bg-slate-200 text-black font-bold';
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        icon: 'p-2'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
