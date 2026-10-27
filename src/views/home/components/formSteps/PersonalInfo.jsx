"use client";

import { useTranslations } from "next-intl";
import React from 'react';

const PersonalInfo = ({ formData, handleInputChange, errors }) => {
  const t = useTranslations("home.form");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("firstName")}
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary/50 border ${errors.firstName ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary placeholder-primary/70`}
          placeholder={t("enterFirstName")}
        />
        {errors.firstName && <p className="text-secondary text-xs mt-1">{errors.firstName}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("lastName")}
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary/50 border ${errors.lastName ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary placeholder-primary/70`}
          placeholder={t("enterLastName")}
        />
        {errors.lastName && <p className="text-secondary text-xs mt-1">{errors.lastName}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("email")}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary/50 border ${errors.email ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary placeholder-primary/70`}
          placeholder={t("enterEmail")}
        />
        {errors.email && <p className="text-secondary text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("phoneNumber")}
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary/50 border ${errors.phoneNumber ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary placeholder-primary/70`}
          placeholder={t("enterPhoneNumber")}
        />
        {errors.phoneNumber && <p className="text-secondary text-xs mt-1">{errors.phoneNumber}</p>}
      </div>
    </div>
  );
};

export default PersonalInfo;
