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
          className={`w-full px-4 py-2 bg-tertiary border ${errors.firstName ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70`}
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
          className={`w-full px-4 py-2 bg-tertiary border ${errors.lastName ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70`}
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
          className={`w-full px-4 py-2 bg-tertiary border ${errors.email ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70`}
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
          className={`w-full px-4 py-2 bg-tertiary border ${errors.phoneNumber ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70`}
          placeholder={t("enterPhoneNumber")}
        />
        {errors.phoneNumber && <p className="text-secondary text-xs mt-1">{errors.phoneNumber}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("dateOfBirth")}
        </label>
        <input
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary border ${errors.dateOfBirth ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary cursor-pointer`}
        />
        {errors.dateOfBirth && <p className="text-secondary text-xs mt-1">{errors.dateOfBirth}</p>}
      </div>
    </div>
  );
};

export default PersonalInfo;
