"use client";

import { useLocale, useTranslations } from "next-intl";
import { submitContactMessage } from '@/server/messages';
import React, { useState } from 'react';
import PrimaryButton from '../common/buttons/PrimaryButton';

const PartnershipForm = ({ onClose }) => {
  const locale = useLocale();
  const t = useTranslations("forms.partnership");
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    sponsorshipTier: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const sponsorshipTiers = [
    { value: '', label: t("tierSelect") },
    { value: 'tanzanite', label: t("tierTanzanite") },
    { value: 'platinum', label: t("tierPlatinum") },
    { value: 'gold', label: t("tierGold") },
    { value: 'silver', label: t("tierSilver") },
    { value: 'custom', label: t("tierCustom") }
  ];

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
    
    if (!formData.companyName.trim()) newErrors.companyName = t("companyRequired");
    if (!formData.contactPerson.trim()) newErrors.contactPerson = t("contactRequired");
    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }
    if (!formData.sponsorshipTier) newErrors.sponsorshipTier = t("tierRequired");
    if (!formData.message.trim()) newErrors.message = t("detailsRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await submitContactMessage({
        kind: 'partnership',
        name: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        company: formData.companyName,
        website: formData.website,
        sponsorship_tier: formData.sponsorshipTier,
        message: formData.message,
      }, locale);
      if (!result.success) {
        setIsSubmitting(false);
        setErrors({ form: t("submitFailed") });
        return;
      }
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          website: '',
          sponsorshipTier: '',
          message: ''
        });
        setIsSubmitting(false);
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
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
        <h3 className="text-2xl font-medium text-primary mb-2">{t("submittedTitle")}</h3>
        <p className="text-primary/70 mb-6">{t("submittedText")}</p>
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
      
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-primary mb-1">{t("companyLabel")}</label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.companyName ? 'border-red' : 'border-primary'}`}
          placeholder={t("companyPlaceholder")}
        />
        {errors.companyName && <p className="mt-1 text-sm text-red/90">{errors.companyName}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-primary mb-1">{t("contactLabel")}</label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.contactPerson ? 'border-red' : 'border-primary'}`}
            placeholder={t("contactPlaceholder")}
          />
          {errors.contactPerson && <p className="mt-1 text-sm text-red/90">{errors.contactPerson}</p>}
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
            placeholder="contact@company.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red/90">{errors.email}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label htmlFor="website" className="block text-sm font-medium text-primary mb-1">{t("websiteLabel")}</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-primary rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors"
            placeholder="https://www.yourcompany.com"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="sponsorshipTier" className="block text-sm font-medium text-primary mb-1">{t("tierLabel")}</label>
        <select
          id="sponsorshipTier"
          name="sponsorshipTier"
          value={formData.sponsorshipTier}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.sponsorshipTier ? 'border-red' : 'border-primary'}`}
        >
          {sponsorshipTiers.map((tier) => (
            <option key={tier.value} value={tier.value}>{tier.label}</option>
          ))}
        </select>
        {errors.sponsorshipTier && <p className="mt-1 text-sm text-red/90">{errors.sponsorshipTier}</p>}
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-1">{t("detailsLabel")}</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="5"
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors ${errors.message ? 'border-red' : 'border-primary'}`}
          placeholder={t("detailsPlaceholder")}
        ></textarea>
        {errors.message && <p className="mt-1 text-sm text-red/90">{errors.message}</p>}
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 border border-primary/30 text-primary/90 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
        >
          {t("cancel")}
        </button>
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("submitting")}
            </>
          ) : t("submit")}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default PartnershipForm;
