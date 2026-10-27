"use client";

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faSpinner } from '@fortawesome/free-solid-svg-icons';

const StatCard = ({ title, value, change, positive, icon, loading }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-xl p-5 ${theme === 'dark' ? 'bg-primary' : 'bg-tertiary shadow-md'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-tertiary opacity-70' : 'text-primary opacity-70'}`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
            {loading ? (
              <span className="flex items-center">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                <span className="text-sm">Loading...</span>
              </span>
            ) : (
              value
            )}
          </h3>
          <div className={`flex items-center mt-1 ${positive ? 'text-secondary' : 'text-red'}`}>
            {loading ? (
              <span className="text-xs opacity-70">Calculating...</span>
            ) : (
              <>
                <span>{change}</span>
                {typeof change === 'string' && change.includes('%') && (
                  <span className="ml-1 text-xs">
                    <FontAwesomeIcon icon={positive ? faArrowUp : faArrowDown} />
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-primary' : 'bg-primary/20'} ${theme === 'dark' ? 'text-secondary' : 'text-primary'}`}>
          <FontAwesomeIcon icon={loading ? faSpinner : icon} className={`text-xl ${loading ? 'fa-spin' : ''}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
