"use client";

import { useLocale, useTranslations } from "next-intl";
import { submitContactMessage } from '@/server/messages';
import React, { useState } from 'react';
import PrimaryButton from '../common/buttons/PrimaryButton';

const GeneralContactForm = ({ onClose }) => {
  const locale = useLocale();
  const t = useTranslations("forms.contact");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t("nameRequired");
    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }
    if (!formData.subject.trim()) newErrors.subject = t("subjectRequired");
    if (!formData.message.trim()) newErrors.message = t("messageRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await submitContactMessage({ kind: 'contact', ...formData }, locale);
      if (!result.success) {
        setIsSubmitting(false);
        setErrors({ form: t("submitFailed") });
        return;
      }
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setIsSubmitting(false);
        // In a modal: close after 2 seconds. On the contact page: show the form again.
        setTimeout(() => {
          if (onClose) onClose();
          else setSubmitSuccess(false);
        }, onClose ? 2000 : 5000);
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      setErrors({ form: t("submitFailed") });
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-6">
          <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-medium text-primary mb-2">{t("thankYou")}</h3>
        <p className="text-primary/70 mb-6">{t("sent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="p-3 bg-secondary/50 border border-secondary/80 text-secondary rounded-md">
          {errors.form}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">{t("nameLabel")}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.name ? 'border-red' : 'border-primary'}`}
            placeholder={t("namePlaceholder")}
          />
          {errors.name && <p className="mt-1 text-sm text-red/90">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">{t("emailLabel")}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.email ? 'border-red' : 'border-primary'}`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red/90">{errors.email}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">{t("phoneLabel")}</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-primary rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors"
          placeholder="+255 123 456 789"
        />
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary mb-1">{t("subjectLabel")}</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.subject ? 'border-red' : 'border-primary'}`}
          placeholder={t("subjectPlaceholder")}
        />
        {errors.subject && <p className="mt-1 text-sm text-red/90">{errors.subject}</p>}
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-1">{t("messageLabel")}</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="5"
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.message ? 'border-red' : 'border-primary'}`}
          placeholder={t("messagePlaceholder")}
        ></textarea>
        {errors.message && <p className="mt-1 text-sm text-red/90">{errors.message}</p>}
      </div>
      
      <div className="flex justify-end space-x-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 border border-primary/30 text-primary/90 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
        )}
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("sending")}
            </>
          ) : t("send")}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default GeneralContactForm;
