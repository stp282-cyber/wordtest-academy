import React from 'react';

const Card = ({ children, className = '', hover = false, glass = false, ...props }) => {
    // glass prop is ignored in anti-brutalism or converted to a specific look
    // We'll treat 'glass' as just a standard card here to override previous usage

    return (
        <div
            {...props}
            className={`
        neo-card
        ${hover ? 'hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
