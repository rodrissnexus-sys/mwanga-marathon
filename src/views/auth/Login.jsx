"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '@/lib/router';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const t = useTranslations("common.login");
  const { login, currentUser, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormErrors({});
    
    if (!email || !password) {
      setFormError(t("fillAll"));
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormErrors(result.errors || {});
        setFormError(result.errors?.general?.[0] || t("failed"));
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.status === 401) {
        setFormError(t("invalid"));
      } else if (err.status === 429) {
        setFormError(t("tooMany"));
      } else if (err.status >= 500) {
        setFormError(t("serverError"));
      } else {
        setFormError(t("unexpected"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tertiary text-primary">
      <div className="max-w-md w-full p-8 rounded-lg bg-tertiary">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("title")}</h2>
          <p className="text-primary/85">
            {t("subtitle")}
          </p>
        </div>

        {(formError || authError) && (
          <div className="mb-6 p-4 bg-secondary/50 text-primary rounded-lg flex items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 mt-1 flex-shrink-0" />
            <div>
              <span>{formError || authError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="your@email.com"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-secondary">{formErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="••••••••"
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-negative">{formErrors.password[0]}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary/90 transition duration-300 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  {t("loggingIn")}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  {t("login")}
                </>
              )}
            </button>
          </div>
          <div className="mt-4 text-center">
              {t.rich("forgot", { link: (chunks) => <a href="#" className="font-medium text-primary/65 underline hover:underline">{chunks}</a> })}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
