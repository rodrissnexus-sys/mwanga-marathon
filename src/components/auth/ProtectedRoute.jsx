"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { Navigate, useLocation } from '@/lib/router';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * ProtectedRoute component that ensures a user is authenticated
 * and optionally has the required role before allowing access to a route
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const t = useTranslations("common.auth");
  const { currentUser, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-secondary text-4xl mb-4" />
          <p className="text-tertiary">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;
