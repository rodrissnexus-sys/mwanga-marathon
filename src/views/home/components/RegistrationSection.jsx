"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import {Link} from '@/lib/router';
import PersonalInfo from "./formSteps/PersonalInfo";
import EventDetails from "./formSteps/EventDetails";
import AdditionalInfo from "./formSteps/AdditionalInfo";
import EmergencyContact from "./formSteps/EmergencyContact";
import { useMarathonRegistration } from "../../../hooks/useMarathonRegistration";
import { useDropdowns } from "../../../hooks/useDropdowns";


const RegistrationSection = () => {
  const t = useTranslations("home.registration");
  const {
    events,
    sizes,
    kidsSizes,
    collectionVenues,
    countries,
    genders,
    rawData,
    loading: dropdownsLoading,
    error: dropdownsError 
  } = useDropdowns();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    gender_id: "",
    nationality: "",
    nationality_id: "",
    country: "",
    country_id: "",
    postalCode: "",
    idNumber: "",
    passportNumber: "",
    event: "",
    event_id: "",
    shirtSize: "",
    shirt_size_id: "",
    kidsShirtSize: "",
    kids_shirt_size_id: "",
    collectionVenue: "",
    collection_venue_id: "",
    voucherCode: "",
    emergencyContactName: "",
    emergencyContactNumber: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      // Handle special cases for IDs
      if (name === 'gender') {
        const selectedGender = genders.find(gender => gender.id === parseInt(value));
        if (selectedGender) {
          newData[name] = selectedGender.name;
          newData.gender_id = selectedGender.id;
        }
      } else if (name === 'country') {
        const selectedCountry = countries.find(country => country.id === parseInt(value));
        if (selectedCountry) {
          newData[name] = selectedCountry.name;
          newData.country_id = selectedCountry.id;
          // If this is also their nationality, update that too
          if (newData.nationality === 'tz_ea' || 
              newData.nationality === 'tz_resident_sadc') {
            newData.nationality_id = selectedCountry.id;
          }
        }
      } else if (name === 'nationality') {
        newData[name] = value;
        // For nationality categories, set nationality_id to the country_id if it's Tanzania-related
        if (value === 'tz_ea' || 
            value === 'tz_resident_sadc') {
          const tanzaniaCountry = countries.find(country => country.name === 'Tanzania');
          if (tanzaniaCountry) {
            newData.nationality_id = tanzaniaCountry.id;
          }
        }
      } else if (name === 'event') {
        const selectedEvent = events.find(event => event.name === value);
        if (selectedEvent) {
          newData.event_id = selectedEvent.id;
        }
        newData[name] = value;
      } else if (name === 'collectionVenue') {
        const selectedVenue = collectionVenues.find(venue => venue.name === value);
        if (selectedVenue) {
          newData.collection_venue_id = selectedVenue.id;
        }
        newData[name] = value;
      } else if (name === 'shirtSize') {
        const selectedSize = rawData.shirtSizes.find(size => size.code === value);
        if (selectedSize) {
          newData.shirt_size_id = selectedSize.id;
        }
        newData[name] = value;
      } else if (name === 'kidsShirtSize') {
        const selectedSize = rawData.kidsShirtSizes.find(size => size.code === value);
        if (selectedSize) {
          newData.kids_shirt_size_id = selectedSize.id;
        }
        newData[name] = value;
      } else if (name === 'collection_venue_id') {
        newData[name] = parseInt(value);
      } else {
        newData[name] = value;
      }
      return newData;
    });

    setErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "event") {
      setShowKidsSizes(Boolean(events.find((event) => event.name === value)?.isKidsEvent));
    }
    if (name === "shirtSize") {
      setSelectedSize(value);
    }
    if (name === "kidsShirtSize") {
      setSelectedKidsSize(value);
    }
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKidsSizes, setShowKidsSizes] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedKidsSize, setSelectedKidsSize] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasSetInitialValues, setHasSetInitialValues] = useState(false);

  useEffect(() => {
    if (!dropdownsLoading && !hasSetInitialValues && events.length > 0 && sizes.length > 0 && kidsSizes.length > 0) {      
      setFormData(prev => ({
        ...prev,
        shirtSize: sizes[0] || "",
        shirt_size_id: rawData.shirtSizes[0]?.id || "",
        kidsShirtSize: kidsSizes[0] || "",
        kids_shirt_size_id: rawData.kidsShirtSizes[0]?.id || ""
      }));

      setSelectedSize(sizes[0] || "");
      setSelectedKidsSize(kidsSizes[0] || "");
      setHasSetInitialValues(true);
    }
  }, [dropdownsLoading, events, sizes, kidsSizes, rawData, hasSetInitialValues]);

  const { handleRegistration, isSubmitting: isApiSubmitting, error: apiError, validationErrors: apiValidationErrors, retryAfter } = useMarathonRegistration();

  const nationalityCategories = [
    "tz_ea",
    "tz_resident_sadc",
    "international"
  ];

  const benefits = [
    t("eventEntryAndOfficial"),
    t("exclusiveFestivalAccessFor"),
    t("commemorativeTShirtAnd"),
    t("foodAndDrinkVouchers")
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = t("firstNameIsRequired");
        if (!formData.lastName.trim()) newErrors.lastName = t("lastNameIsRequired");
        if (!formData.email.trim()) {
          newErrors.email = t("emailIsRequired");
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = t("emailIsInvalid");
        }
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = t("phoneNumberIsRequired");
        break;
      case 2:
        if (!formData.collection_venue_id) newErrors.collectionVenue = t("collectionVenueIsRequired");
        if (!formData.event_id) newErrors.event = t("eventIsRequired");
        if (showKidsSizes ? !formData.kids_shirt_size_id : !formData.shirt_size_id) {
          newErrors.shirtSize = t("shirtSizeIsRequired");
        }
        break;
      case 3:
        if (!formData.nationality) newErrors.nationality = t("errors.nationalityRequired");
        // Explicitly check for nationality_id
        if (!formData.nationality_id) {
          // Try to set nationality_id based on nationality
          if (formData.nationality === 'tz_ea' || 
              formData.nationality === 'tz_resident_sadc') {
            const tanzaniaCountry = countries.find(country => country.name === 'Tanzania');
            if (tanzaniaCountry) {
              setFormData(prev => ({
                ...prev,
                nationality_id: tanzaniaCountry.id
              }));
            } else {
              newErrors.nationality = t("errors.nationalityAgain");
            }
          } else if (formData.nationality === 'international' && formData.country_id) {
            setFormData(prev => ({
              ...prev,
              nationality_id: prev.country_id
            }));
          } else {
            newErrors.nationality = t("errors.nationalityAndCountry");
          }
        }
        if (!formData.dateOfBirth) newErrors.dateOfBirth = t("errors.dobRequired");
        if (!formData.gender) newErrors.gender = t("errors.genderRequired");
        break;
      case 4:
        if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = t("errors.emergencyNameRequired");
        if (!formData.emergencyContactNumber.trim()) newErrors.emergencyContactNumber = t("errors.emergencyNumberRequired");
        // Final check for nationality_id before submission
        if (!formData.nationality_id) {
          newErrors.nationality = t("errors.nationalityIncomplete");
        }
        break;
      default:
        break;
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    } else {
      setErrors(stepErrors);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length === 0) {
      setIsSubmitting(true);
      setSuccessMessage("");
      
      // Ensure nationality_id is set
      let updatedFormData = { ...formData };
      
      // If nationality_id is missing but nationality is set, try to set it
      if (!updatedFormData.nationality_id && updatedFormData.nationality) {
        if (updatedFormData.nationality === 'tz_ea' || 
            updatedFormData.nationality === 'tz_resident_sadc') {
          // For Tanzania-related options, set nationality_id to Tanzania's ID
          const tanzaniaCountry = countries.find(country => country.name === 'Tanzania');
          if (tanzaniaCountry) {
            updatedFormData.nationality_id = tanzaniaCountry.id;
          }
        } else if (updatedFormData.nationality === 'international' && updatedFormData.country_id) {
          // For international participants, set nationality_id to match country_id
          updatedFormData.nationality_id = updatedFormData.country_id;
        }
      }
      
      const registrationData = {
        ...updatedFormData,
        shirt_size_id: showKidsSizes ? updatedFormData.kids_shirt_size_id : updatedFormData.shirt_size_id,
        kids_shirt_size_id: showKidsSizes ? updatedFormData.kids_shirt_size_id : null,
        idNumber: updatedFormData.idNumber?.toString() || "",
        passportNumber: updatedFormData.passportNumber?.toString() || "",
      };

      // Log the data being sent to the API
      console.log("Sending registration data:", registrationData);
      
      const success = await handleRegistration(registrationData);

      if (success) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          event: "",
          event_id: "",
          shirtSize: "",
          shirt_size_id: "",
          kidsShirtSize: "",
          kids_shirt_size_id: "",
          idNumber: "",
          passportNumber: "",
          dateOfBirth: "",
          age: "",
          gender: "",
          gender_id: "",
          postalCode: "",
          phoneNumber: "",
          nationality: "",
          nationality_id: "",
          collectionVenue: "",
          collection_venue_id: "",
          country: "",
          country_id: "",
          emergencyContactName: "",
          emergencyContactNumber: "",
          voucherCode: ""
        });
        setCurrentStep(1);
        setSuccessMessage(t("registrationSuccessfulThankYou"));
      }
      setIsSubmitting(false);
    } else {
      setErrors(stepErrors);
    }
  };

  const renderStepContent = () => {
    const combinedErrors = {
      ...errors,
      ...apiValidationErrors
    };

    switch (currentStep) {
      case 1:
        return (
          <PersonalInfo
            formData={formData}
            handleInputChange={handleInputChange}
            errors={combinedErrors}
          />
        );
      case 2:
        return (
          <EventDetails
            formData={formData}
            handleInputChange={handleInputChange}
            errors={combinedErrors}
            events={events}
            showKidsSizes={showKidsSizes}
            sizes={sizes}
            kidsSizes={kidsSizes}
            selectedSize={selectedSize}
            selectedKidsSize={selectedKidsSize}
            collectionVenues={collectionVenues}
            rawData={rawData}
          />
        );
      case 3:
        return (
          <AdditionalInfo
            formData={formData}
            handleInputChange={handleInputChange}
            errors={combinedErrors}
            nationalityCategories={nationalityCategories}
            countries={countries}
            genders={genders}
          />
        );
      case 4:
        return (
          <EmergencyContact
            formData={formData}
            handleInputChange={handleInputChange}
            errors={combinedErrors}
          />
        );
      default:
        return null;
    }
  };

  if (dropdownsLoading) {
    return <div className="text-center py-8">{t("loadingFormOptions")}</div>;
  }

  if (dropdownsError) {
    return <div className="text-center py-8 text-red-500">{t("errorLoadingFormOptions")}</div>;
  }

  return (
    <section id="register" className="py-20 bg-primary overflow-hidden relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary opacity-5 rounded-full -ml-32 -mt-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary opacity-5 rounded-full -mr-48 -mb-48"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="mb-16 relative">
          <div className="absolute left-0 top-1/2 w-16 h-px bg-secondary"></div>
          <div className="absolute right-0 top-1/2 w-16 h-px bg-secondary"></div>
          
          <h2 className="text-center text-4xl font-light tracking-widest uppercase">
            <span className="inline-block transform -skew-y-3 text-secondary">{t("titleFirst")}</span>
            <span className="inline-block ml-3 text-tertiary relative">
              {t("titleSecond")}
              <span className="absolute -bottom-2 left-0 w-full h-px bg-tertiary"></span>
            </span>
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-light mb-6 flex text-tertiary items-center">
              <span className="inline-block w-8 h-px bg-secondary mr-4"></span>
              {t("registerNowFor")} 
              <span className="text-secondary ml-2 font-normal">{t("earlyBirdDiscounts")}</span>
            </h3>
            
            <p className="text-tertiary mb-10 backdrop-blur-sm bg-tertiary/5 p-6 border-l-2 border-secondary">
              {t("secureYourSpotIn")}
            </p>
            
            <div className="space-y-6 relative">
              <div className="absolute left-1.5 top-3 bottom-0 w-px bg-secondary"></div>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="relative ml-10 group">
                  <div className="absolute -left-10 top-1.5 w-3 h-3">
                    <div className="w-3 h-3 bg-secondary rounded-full absolute"></div>
                    <div className="w-6 h-6 bg-primary border-2 border-tertiary rounded-full -ml-1.5 -mt-1.5 group-hover:scale-125 transition-transform duration-300"></div>
                  </div>
                  
                  <p className="text-tertiary transform transition-all duration-300 group-hover:translate-x-2">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between">
                {[t("personalInformation"), t("eventDetails"), t("additionalInformation"), t("emergencyContact")].map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > index + 1 ? 'bg-secondary text-primary' : currentStep === index + 1 ? 'bg-secondary text-primary' : 'bg-tertiary/20 text-tertiary'}`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-full h-1 mx-2 ${currentStep > index + 1 ? 'bg-secondary' : 'bg-tertiary/20'}`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-tertiary">
                {[t("personalInformation"), t("eventDetails"), t("additionalInformation"), t("emergencyContact")][currentStep - 1]}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 bg-tertiary/5 backdrop-blur-sm p-8 border-t-2 border-secondary">
            <h3 className="text-xl font-light text-tertiary mb-8 relative inline-block">
              {t("registrationForm")}
              <span className="absolute -bottom-2 left-0 w-full h-px bg-secondary"></span>
            </h3>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-primary/5 border-l-2 border-secondary/50">
                <p className="mb-2 text-secondary">{successMessage}</p>
                <p className="font-semibold mt-4 text-tertiary">{t("nextStepsMembershipPayment")}</p>
                <ul className="list-disc ml-6 mt-2 space-y-2 text-tertiary">
                  <li>{t("pleaseMakeYourPayment")}</li>
                  <li>{t("yourRegistrationWillBe")}</li>
                  <li>{t("forPaymentSupportContact")} <span className="text-secondary/90">info@mwafem.com</span></li>
                  <li>{t("forPesapalPaymentUse")} <a className="text-secondary/95" href="https://payments.pesapal.com/kisangaratours" target="_blank" rel="noopener noreferrer">Pesapal</a></li>
                </ul>
                <p className="font-semibold mt-4 text-tertiary">{t("learnHowToPay")} <a href="#payment" className="text-secondary underline">{t("here")}</a></p>
              </div>
            )}

            {apiError && !retryAfter && (
              <div className="mb-6 p-4 bg-tertiary/5 border-l-2 border-secondary text-secondary">
                {apiError}
              </div>
            )}

            {retryAfter && (
              <div className="mb-6 p-4 bg-tertiary/5 border-l-2 border-secondary text-secondary">
                Too many attempts. Please try again in {Math.ceil(retryAfter / 60)} minutes.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 border border-tertiary text-tertiary cursor-pointer hover:border-secondary hover:text-secondary transition-colors duration-300"
                  >
                    {t("back")}
                  </button>
                )}
                
                <button 
                  type={currentStep === 4 ? "submit" : "button"}
                  onClick={currentStep === 4 ? undefined : handleNext}
                  disabled={isSubmitting || isApiSubmitting || retryAfter}
                  className="relative overflow-hidden group ml-auto cursor-pointer active:scale-98 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 inline-block px-10 py-3 uppercase tracking-widest text-sm font-medium transition-colors duration-300 text-tertiary group-hover:text-tertiary/80">
                    {isSubmitting || isApiSubmitting ? t("processing") : currentStep === 4 ? t("completeRegistration") : t("next")}
                  </span>
                  
                  <span className="absolute top-0 left-0 w-full h-full border border-primary group-hover:border-transparent transition-colors duration-300"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-full bg-tertiary/40 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
                  
                  <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-secondary"></span>
                  <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-secondary"></span>
                  <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-secondary"></span>
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-secondary"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;