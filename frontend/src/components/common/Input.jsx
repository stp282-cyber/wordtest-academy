import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-bold text-black mb-1.5 ml-1 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            neo-input
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-accent bg-red-50' : 'border-black'}
          `}
                    {...props}
                />
            </div>
            {error && (
                <div className="mt-1 text-sm font-bold text-accent ml-1 flex items-center">
                    <span className="mr-1">!</span> {error}
                </div>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
