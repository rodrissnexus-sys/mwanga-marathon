"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTimes, 
  faUserPlus, 
  faChartBar, 
  faFileExport 
} from '@fortawesome/free-solid-svg-icons';

const FloatingPanel = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'w-80' : 'w-auto'}`}>
      {isOpen ? (
        <div className={`rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-primary/50' : 'bg-tertiary'}`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-secondary' : 'border-gray-200'} flex justify-between items-center`}>
            <h3 className={`font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>Quick Actions</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-primary text-tertiary' : 'hover:bg-gray-100 text-primary'}`}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <button className="w-full py-2 px-3 bg-secondary hover:bg-opacity-90 text-primary rounded-md text-sm flex items-center justify-center">
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                New Registration
              </button>
              <button className={`w-full py-2 px-3 ${theme === 'dark' ? 'bg-primary hover:bg-primary/80 text-tertiary' : 'bg-gray-100 hover:bg-gray-200 text-primary'} rounded-md text-sm flex items-center justify-center`}>
                <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                View Reports
              </button>
              <button className={`w-full py-2 px-3 ${theme === 'dark' ? 'bg-primary hover:bg-primary/80 text-tertiary' : 'bg-gray-100 hover:bg-gray-200 text-primary'} rounded-md text-sm flex items-center justify-center`}>
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}
    </div>
  );
};

export default FloatingPanel;
