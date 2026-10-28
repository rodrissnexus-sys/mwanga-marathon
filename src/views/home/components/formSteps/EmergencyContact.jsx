"use client";

import { useTranslations } from "next-intl";
import React from 'react';

const EmergencyContact = ({ formData, handleInputChange, errors }) => {
  const t = useTranslations("home.form");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("emergencyContactName")}
        </label>
        <input
          type="text"
          name="emergencyContactName"
          value={formData.emergencyContactName}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary border ${errors.emergencyContactName ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70`}
          placeholder={t("enterEmergencyContactName")}
        />
        {errors.emergencyContactName && <p className="text-secondary text-xs mt-1">{errors.emergencyContactName}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("emergencyContactNumber")}
        </label>
        <input
          type="tel"
          name="emergencyContactNumber"
          value={formData.emergencyContactNumber}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary border ${errors.emergencyContactNumber ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70`}
          placeholder={t("enterEmergencyContactNumber")}
        />
        {errors.emergencyContactNumber && <p className="text-secondary text-xs mt-1">{errors.emergencyContactNumber}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("postalCode")}
        </label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-tertiary border border-tertiary rounded-sm focus:border-secondary focus:outline-none text-primary placeholder-primary/70"
          placeholder={t("enterPostalCode")}
        />
      </div>
    </div>
  );
};

export default EmergencyContact;
