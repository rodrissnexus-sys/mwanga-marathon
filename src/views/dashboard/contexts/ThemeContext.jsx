"use client";

import React, { createContext, useContext } from 'react';

// The dashboard is light only. Older pages still read `theme` to pick
// classes, so the context stays and always says 'light'.
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {} }}>
    {children}
  </ThemeContext.Provider>
);
