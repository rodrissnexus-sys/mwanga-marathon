"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PackageEditor = ({ packageType, features = [], onChange, errors = {} }) => {
  const { theme } = useTheme();
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...features, newFeature.trim()];
      onChange(packageType, {
        [`${packageType}_features`]: updatedFeatures
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    onChange(packageType, {
      [`${packageType}_features`]: updatedFeatures
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  // Format the package type for display (e.g., "fun_run" -> "Fun Run")
  const formatPackageType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const hasError = errors[`${packageType}_features`];

  return (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-primary border-primary/15' : 'bg-tertiary border-primary/15'}`}>
      <h3 className="text-lg font-semibold mb-4">{formatPackageType(packageType)} Features</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Features
          {hasError && <span className="text-primary ml-1">*</span>}
        </label>
        
        <div className="flex mb-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-grow p-2 rounded-l border-y border-l ${
              theme === 'dark' 
                ? 'bg-primary border-primary/15 text-tertiary' 
                : 'bg-tertiary border-primary/15'
            } ${hasError ? 'border-primary' : ''}`}
            placeholder="Add a feature (e.g., T-shirt, Medal, Refreshments)"
          />
          <button
            onClick={handleAddFeature}
            className="px-3 py-2 bg-secondary text-primary font-medium rounded-r hover:bg-secondary/90 transition-colors"
            type="button"
          >
            <Plus size={18} />
          </button>
        </div>
        
        {hasError && <p className="text-primary text-xs mb-2">{hasError}</p>}
        
        <ul className={`rounded border ${
          theme === 'dark' 
            ? 'bg-primary border-primary/15' 
            : 'bg-primary/[0.03] border-primary/15'
        } divide-y ${
          theme === 'dark' ? 'divide-primary/15' : 'divide-primary/15'
        } max-h-48 overflow-y-auto`}
        >
          {features.length === 0 ? (
            <li className="p-3 text-sm text-primary/70">No features added yet</li>
          ) : (
            features.map((feature, index) => (
              <li key={index} className="p-2 flex justify-between items-center">
                <span className="text-sm">{feature}</span>
                <button
                  onClick={() => handleRemoveFeature(index)}
                  className="text-primary hover:text-primary/80 transition-colors"
                  type="button"
                >
                  <Minus size={16} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      
      <p className="text-xs text-primary/70">
        Add features that will be included in this package. These will be displayed to participants during registration.
      </p>
    </div>
  );
};

export default PackageEditor;
