"use client";

import React from 'react';

const PrimaryButton = ({ children, className = '', compact = false, ...props }) => {
  return (
    <button 
      className={`relative overflow-hidden group active:scale-98 cursor-pointer ${className}`}
      {...props}
    >
      <span className={`relative z-10 w-full text-primary inline-block uppercase tracking-wider font-medium transition-colors duration-300 group-hover:text-primary ${compact ? 'px-4 py-2 text-xs' : 'px-8 py-4 text-sm'}`}>
        {children}
      </span>
      
      {/* Button decoration and effects */}
      <span className="absolute top-0 left-0 w-full h-full border border-secondary group-hover:border-transparent transition-colors duration-300"></span>
      <span className="absolute bottom-0 left-0 w-0 h-full bg-secondary group-hover:w-full transition-all duration-300 ease-out z-0"></span>
      
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60"></span>
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60"></span>
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60"></span>
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60"></span>
    </button>
  );
};

export default PrimaryButton;
