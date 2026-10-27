"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from "react";

const AdditionalInfo = ({ formData, handleInputChange, errors, nationalityCategories, countries, genders }) => {
  const t = useTranslations("home.form");
  const tNationality = useTranslations("home.registration.nationality");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const dropdownRef = useRef(null);

  // Filter countries based on search query
  useEffect(() => {
    if (Array.isArray(countries)) {
      if (searchQuery.trim() === "") {
        setFilteredCountries(countries);
      } else {
        const filtered = countries.filter(country => 
          country.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCountries(filtered);
      }
    }
  }, [searchQuery, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle country selection
  const handleCountrySelect = (countryId) => {
    const event = {
      target: {
        name: "country",
        value: countryId
      }
    };
    handleInputChange(event);
    
    // If nationality is "International", set nationality_id to match country_id
    if (formData.nationality === 'international') {
      const nationalityIdEvent = {
        target: {
          name: "nationality_id",
          value: countryId
        }
      };
      handleInputChange(nationalityIdEvent);
    }
    
    setShowCountryDropdown(false);
    setSearchQuery("");
  };

  // Get selected country name
  const getSelectedCountryName = () => {
    if (!formData.country) return "";
    const selectedCountry = countries?.find(c => c.id === parseInt(formData.country));
    return selectedCountry ? selectedCountry.name : "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("nationalityCategory")}
        </label>
        <div className="relative">
          <select 
            name="nationality"
            value={formData.nationality}
            onChange={(e) => {
              // Handle the nationality selection and set nationality_id
              const selectedNationality = e.target.value;
              handleInputChange(e);
              
              // Set nationality_id based on selection
              if (selectedNationality === 'tz_ea' || 
                  selectedNationality === 'tz_resident_sadc') {
                // For Tanzania-related options, set nationality_id to Tanzania's ID
                const tanzaniaCountry = countries?.find(country => country.name === 'Tanzania');
                if (tanzaniaCountry) {
                  const event = {
                    target: {
                      name: "nationality_id",
                      value: tanzaniaCountry.id
                    }
                  };
                  handleInputChange(event);
                }
              } else if (selectedNationality === 'international') {
                // For international participants, set nationality_id to the selected country
                if (formData.country) {
                  const event = {
                    target: {
                      name: "nationality_id",
                      value: formData.country
                    }
                  };
                  handleInputChange(event);
                }
              }
            }}
            className={`w-full appearance-none px-4 py-2 bg-tertiary/50 border ${errors.nationality ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary cursor-pointer`}
          >
            <option value="" className="text-primary/70">{t("selectNationalityCategory")}</option>
            {nationalityCategories.map((nationality, index) => (
              <option key={index} value={nationality} className="text-primary bg-tertiary/20">
                {tNationality(nationality)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        {errors.nationality && <p className="text-secondary text-xs mt-1">{errors.nationality}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("idNumber")}
        </label>
        <input
          type="text"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-tertiary/50 border border-tertiary rounded-sm focus:border-secondary focus:outline-none text-tertiary placeholder-primary/70"
          placeholder={t("enterIdNumber")}
        />
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("passportNumber")}
        </label>
        <input
          type="text"
          name="passportNumber"
          value={formData.passportNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-tertiary/50 border border-tertiary rounded-sm focus:border-secondary focus:outline-none text-tertiary placeholder-primary/70"
          placeholder={t("enterPassportNumber")}
        />
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("dateOfBirth")}
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 bg-tertiary/50 border ${errors.dateOfBirth ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary cursor-pointer`}
        />
        {errors.dateOfBirth && <p className="text-secondary text-xs mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("gender")}
        </label>
        <div className="relative">
          <select 
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full appearance-none px-4 py-2 bg-tertiary/50 border ${errors.gender ? 'border-red-500' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-tertiary cursor-pointer`}
          >
            <option value="" className="text-primary/70">{t("selectGender")}</option>
            {genders.map((gender) => (
              <option key={gender.id} value={gender.id} className="text-primary bg-tertiary/20">
                {gender.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        {errors.gender && <p className="text-secondary text-xs mt-1">{errors.gender}</p>}
      </div>

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("country")}
        </label>
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className={`w-full px-4 py-2 bg-tertiary/50 border ${errors.country ? 'border-red/50' : 'border-tertiary'} rounded-sm focus:border-secondary text-tertiary cursor-pointer flex justify-between items-center`}
          >
            <span className={formData.country ? "text-tertiary" : "text-primary/70"}>
              {formData.country ? getSelectedCountryName() : t("selectCountry")}
            </span>
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          
          {showCountryDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-tertiary/90 border border-tertiary rounded-sm shadow-lg max-h-60 overflow-y-auto">
              <div className="sticky top-0 bg-tertiary/95 p-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchCountry")}
                  className="w-full p-2 border border-tertiary/50 rounded-sm focus:outline-none focus:border-secondary text-primary bg-tertiary/50"
                />
              </div>
              <div>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div
                      key={country.id}
                      onClick={() => handleCountrySelect(country.id)}
                      className={`p-2 hover:bg-secondary/20 cursor-pointer ${parseInt(formData.country) === country.id ? 'bg-secondary/30' : ''}`}
                    >
                      {country.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-primary/70">{t("noCountriesFound")}</div>
                )}
              </div>
            </div>
          )}
        </div>
        {errors.country && <p className="text-secondary text-xs mt-1">{errors.country}</p>}
      </div>
    </div>
  );
};

export default AdditionalInfo;
