"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from 'react';
import { CATEGORY_FEES, FOREIGN_FEE, ageOnRaceDay, categoriesForAge, formatMoney } from '@/lib/payments';

const EventDetails = ({ formData, handleInputChange, errors, events, showKidsSizes, sizes, kidsSizes, selectedSize, selectedKidsSize, collectionVenues, rawData }) => {
  const t = useTranslations("home.form");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    if (formData.event && Array.isArray(events)) {
      const event = events.find(e => e.name === formData.event);
      setSelectedEvent(event);
    }
  }, [formData.event, events]);

  useEffect(() => {
    if (formData.collectionVenue && Array.isArray(collectionVenues)) {
      const venue = collectionVenues.find(v => v.name === formData.collectionVenue);
      setSelectedVenue(venue);
    }
  }, [formData.collectionVenue, collectionVenues]);

  const handleEventChange = (e) => {
    const selectedEventName = e.target.value;
    const event = events.find(ev => ev.name === selectedEventName);
    setSelectedEvent(event);
    handleInputChange({
      target: {
        name: 'event',
        value: selectedEventName
      }
    });
  };

  const handleVenueChange = (e) => {
    const selectedVenueName = e.target.value;
    
    const venue = collectionVenues.find(v => v.name === selectedVenueName);
    
    setSelectedVenue(venue);
    handleInputChange({
      target: {
        name: 'collectionVenue',
        value: selectedVenueName
      }
    });
    if (venue) {
      handleInputChange({
        target: {
          name: 'collection_venue_id',
          value: venue.id
        }
      });
    }
  };

  const allowedCategories = categoriesForAge(ageOnRaceDay(formData.dateOfBirth));

  // Add error display for required fields
  const showError = (fieldName) => {
    if (errors && errors[fieldName]) {
      return <p className="text-secondary text-xs mt-1">{errors[fieldName]}</p>;
    }
    return null;
  };

  const handleSizeChange = (size, id) => {
    handleInputChange({ target: { name: 'shirtSize', value: size } });
    handleInputChange({ target: { name: 'shirt_size_id', value: id } });
  };

  const handleKidsSizeChange = (size, id) => {
    handleInputChange({ target: { name: 'kidsShirtSize', value: size } });
    handleInputChange({ target: { name: 'kids_shirt_size_id', value: id } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("eventSelection")}
        </label>
        <div className="relative">
          <select 
            name="event"
            value={formData.event || ''}
            onChange={handleEventChange}
            className={`w-full appearance-none px-4 py-2 bg-tertiary border ${errors?.event ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary cursor-pointer`}
          >
            <option value="" className="bg-primary/80 text-tertiary">{t("selectEvent")}</option>
            {Array.isArray(events) && events.map((event) => (
              <option key={event.name} value={event.name} className="bg-primary text-tertiary">
                {event.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        {showError('event')}
        
        {selectedEvent?.description && (
          <p className="mt-3 text-tertiary/90 text-sm">{selectedEvent.description}</p>
        )}
      </div>

      {/* Participant type: sets the entry fee (children and elders follow from the date of birth) */}
      <fieldset className="md:col-span-2">
        <legend className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("participantType")}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {allowedCategories.map((category) => (
            <label
              key={category}
              className={`flex flex-col gap-0.5 p-3 border rounded-sm cursor-pointer transition-colors ${
                formData.participantCategory === category ? 'border-secondary bg-secondary/15' : 'border-tertiary/60 hover:border-secondary'
              }`}
            >
              <input
                type="radio"
                name="participantCategory"
                value={category}
                checked={formData.participantCategory === category}
                onChange={handleInputChange}
                className="sr-only"
              />
              <span className="text-tertiary font-semibold">{t(`categories.${category}`)}</span>
              <span className="text-tertiary/80 text-xs">{t(`categoryHints.${category}`)}</span>
              <span className="text-secondary font-bold mt-1">{formatMoney(CATEGORY_FEES[category], 'TZS')}</span>
            </label>
          ))}
        </div>
        {showError('participantCategory')}
        {allowedCategories.includes('adult') && (
          <p className="text-tertiary/80 text-xs mt-2">
            {t("proofNote")} {t("foreignNote", { fee: formatMoney(FOREIGN_FEE.amount, FOREIGN_FEE.currency) })}
          </p>
        )}
      </fieldset>

      <div className="md:col-span-2">
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("collectionVenue")}
        </label>
        <div className="relative">
          <select 
            name="collectionVenue"
            value={formData.collectionVenue || ''}
            onChange={handleVenueChange}
            className={`w-full appearance-none px-4 py-2 bg-tertiary border ${errors?.collectionVenue ? 'border-secondary ring-2 ring-secondary' : 'border-tertiary'} rounded-sm focus:border-secondary focus:outline-none text-primary cursor-pointer`}
          >
            <option value="" className="bg-primary/80 text-tertiary">{t("selectCollectionVenue")}</option>
            {Array.isArray(collectionVenues) && collectionVenues.map((venue) => (
              <option key={venue.id} value={venue.name} className="bg-primary text-tertiary">
                {venue.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        {showError('collectionVenue')}
        
        {/* Venue Details Card */}
        {selectedVenue && (
          <div className="mt-4 p-4 bg-tertiary/10 rounded-sm border border-tertiary/20">
            <h3 className="text-secondary font-medium mb-2">{selectedVenue.name}</h3>
            <p className="text-tertiary text-sm">{selectedVenue.description}</p>
            {selectedVenue.address && (
              <p className="text-tertiary text-sm mt-2">
                <span className="font-medium">{t("address")}</span> {selectedVenue.address}
              </p>
            )}
          </div>
        )}
      </div>

      {!showKidsSizes ? (
        <div>
          <label className="text-tertiary text-sm mb-3 flex items-center">
            <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
            {t("tShirtSize")}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const sizeObj = rawData.shirtSizes.find(s => s.code === size);
              return (
                <label
                  key={size}
                  className={`px-4 py-2 border cursor-pointer ${
                    formData.shirtSize === size ? 'border-secondary text-secondary' : 'border-tertiary text-tertiary'
                  } hover:border-secondary hover:text-secondary transition-colors duration-300`}
                >
                  <input
                    type="radio"
                    name="shirtSize"
                    value={size}
                    checked={formData.shirtSize === size}
                    onChange={() => handleSizeChange(size, sizeObj?.id)}
                    className="hidden"
                  />
                  {size}
                </label>
              );
            })}
          </div>
          {showError('shirtSize')}
        </div>
      ) : (
        <div>
          <label className="text-tertiary text-sm mb-3 flex items-center">
            <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
            {t("kidsTShirtSize")}
          </label>
          <div className="flex flex-wrap gap-2">
            {kidsSizes.map((size) => {
              const sizeObj = rawData.kidsShirtSizes.find(s => s.code === size);
              return (
                <label
                  key={size}
                  className={`px-4 py-2 border cursor-pointer ${
                    formData.kidsShirtSize === size ? 'border-secondary text-secondary' : 'border-tertiary text-tertiary'
                  } hover:border-secondary hover:text-secondary transition-colors duration-300`}
                >
                  <input
                    type="radio"
                    name="kidsShirtSize"
                    value={size}
                    checked={formData.kidsShirtSize === size}
                    onChange={() => handleKidsSizeChange(size, sizeObj?.id)}
                    className="hidden"
                  />
                  {size}
                </label>
              );
            })}
          </div>
          {showError('kidsShirtSize')}
        </div>
      )}

      <div>
        <label className="text-tertiary text-sm mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-secondary mr-2"></span>
          {t("voucherCode")}
        </label>
        <input
          type="text"
          name="voucherCode"
          value={formData.voucherCode || ''}
          onChange={handleInputChange}
          placeholder={t("enterVoucherCodeIf")}
          className="w-full px-4 py-2 bg-tertiary border border-tertiary rounded-sm focus:border-secondary focus:outline-none text-primary"
        />
      </div>
    </div>
  );
};

export default EventDetails;
