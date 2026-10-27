"use client";

import React from 'react';

const SectionHeader = ({ firstWord, secondWord, className = '' }) => {
  return (
    <div className={`mb-16 relative overflow-hidden ${className}`}>
      <div className="absolute left-4 top-1/2 w-16 h-px bg-primary"></div>
      <div className="absolute right-4 top-1/2 w-16 h-px bg-primary"></div>
      
      <h2 className="text-center text-4xl font-light tracking-widest uppercase px-24">
        <span className="inline-block transform -skew-y-3 text-secondary">{firstWord}</span>
        <span className="inline-block ml-3 relative">
          {secondWord}
          <span className="absolute -bottom-2 left-0 w-full h-px bg-secondary"></span>
        </span>
      </h2>
    </div>
  );
};

export default SectionHeader;
