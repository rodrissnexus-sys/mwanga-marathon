"use client";

import React from 'react';

// Two-word section title: the first word on a lime highlight, the second
// underlined. Navy text throughout so it reads well on light backgrounds.
const SectionHeader = ({ firstWord, secondWord, className = '' }) => {
  return (
    <div className={`mb-16 relative ${className}`}>
      <div className="hidden md:block absolute left-4 top-1/2 w-16 h-px bg-primary/40"></div>
      <div className="hidden md:block absolute right-4 top-1/2 w-16 h-px bg-primary/40"></div>

      <h2 className="text-center text-3xl md:text-4xl font-extrabold tracking-wider uppercase text-primary leading-snug px-2 md:px-24">
        <span className="relative inline-block px-3 mx-1">
          <span aria-hidden="true" className="absolute inset-x-0 inset-y-0.5 bg-secondary -skew-x-6 rounded-sm"></span>
          <span className="relative">{firstWord}</span>
        </span>
        <span className="inline-block ml-2 relative">
          {secondWord}
          <span aria-hidden="true" className="absolute -bottom-1.5 left-0 w-full h-1 rounded-full bg-secondary"></span>
        </span>
      </h2>
    </div>
  );
};

export default SectionHeader;
