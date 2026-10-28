"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faCircleExclamation, faSpinner } from "@fortawesome/free-solid-svg-icons";
import SectionHeader from "@/components/common/SectionHeader";
import { ageOnRaceDay, categoriesForAge, categoryFee, formatMoney } from "@/lib/payments";
import { EVENT } from "@/lib/event";
import RegistrationConfirmation from "./RegistrationConfirmation";
import { useMarathonRegistration } from "../../../hooks/useMarathonRegistration";
import { useDropdowns } from "../../../hooks/useDropdowns";

const EMPTY = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  dateOfBirth: "",
  gender_id: "",
  event_id: "",
  participantCategory: "",
  shirt_size_id: "",
  nationality: "",
  country_id: "",
  idOrPassport: "",
  collection_venue_id: "",
  voucherCode: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
};

const NATIONALITIES = ["tz_ea", "tz_resident_sadc", "international"];
const STEPS = ["personalInformation", "eventDetails", "additionalInformation", "emergencyContact"];
const GENDER_CODES = ["M", "F"];

const inputClass = (error) =>
  `w-full min-h-12 px-4 scroll-mt-36 rounded-lg bg-tertiary text-primary placeholder:text-primary/45 border-2 focus:outline-none focus:border-secondary ${
    error ? "border-secondary" : "border-transparent"
  }`;

const Label = ({ htmlFor, children, as: Tag = "label" }) => (
  <Tag {...(htmlFor ? { htmlFor } : {})} className="flex items-center gap-2 text-sm font-semibold text-tertiary mb-1.5">
    <span aria-hidden="true" className="w-1 h-3.5 rounded-full bg-secondary" />
    {children}
  </Tag>
);

const ErrorText = ({ id, children }) =>
  children ? (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary">
      <FontAwesomeIcon icon={faCircleExclamation} className="text-xs" />
      {children}
    </p>
  ) : null;

// Text input with its label and error message.
const Field = ({ name, label, error, hint, ...props }) => (
  <div>
    <Label htmlFor={`reg-${name}`}>
      {label} {hint && <span className="font-normal text-tertiary/60">({hint})</span>}
    </Label>
    <input
      id={`reg-${name}`}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `reg-${name}-error` : undefined}
      className={inputClass(error)}
      {...props}
    />
    <ErrorText id={`reg-${name}-error`}>{error}</ErrorText>
  </div>
);

// Native select (the phone's own picker) with label and error.
const SelectField = ({ name, label, error, placeholder, options, ...props }) => (
  <div>
    <Label htmlFor={`reg-${name}`}>{label}</Label>
    <div className="relative">
      <select
        id={`reg-${name}`}
        name={name}
        aria-invalid={error ? true : undefined}
        className={`${inputClass(error)} appearance-none pr-10 cursor-pointer`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <ErrorText>{error}</ErrorText>
  </div>
);

// A group of tap-to-choose cards (radio buttons underneath).
const Choices = ({ name, legend, value, onChange, options, error, columns = "sm:grid-cols-2" }) => (
  <fieldset>
    <Label as="legend">{legend}</Label>
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const checked = String(value) === String(option.value);
        return (
          <label
            key={option.value}
            className={`flex items-center gap-3 px-3 py-2.5 min-h-12 rounded-lg border-2 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary ${
              checked ? "border-secondary bg-secondary/15" : "border-tertiary/20 hover:border-tertiary/50"
            }`}
          >
            <input type="radio" name={name} value={option.value} checked={checked} onChange={() => onChange(name, option.value)} className="sr-only" />
            <span
              aria-hidden="true"
              className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${checked ? "border-secondary bg-secondary text-primary" : "border-tertiary/50"}`}
            >
              {checked && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold text-tertiary">{option.label}</span>
                {option.aside && <span className="font-bold text-secondary">{option.aside}</span>}
              </span>
              {option.hint && <span className="block text-xs text-tertiary/70 mt-0.5">{option.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
    <ErrorText>{error}</ErrorText>
  </fieldset>
);

const RegistrationSection = () => {
  const t = useTranslations("home.registration");
  const tf = useTranslations("home.form");
  const { events, collectionVenues, countries, genders, rawData, loading, error: loadError } = useDropdowns();
  const { handleRegistration, isSubmitting, error: apiError, retryAfter } = useMarathonRegistration();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showVoucher, setShowVoucher] = useState(false);
  // the saved registration, shown instead of the form until "register another"
  const [registered, setRegistered] = useState(null);
  const cardRef = useRef(null);
  const moved = useRef(false);

  const tanzania = countries.find((c) => c.code === "TZA") || countries.find((c) => c.name === "Tanzania");
  const local = form.nationality !== "international";
  const allowedCategories = categoriesForAge(ageOnRaceDay(form.dateOfBirth));
  const isChild = allowedCategories[0] === "child";
  const sizes = isChild ? rawData.kidsShirtSizes : rawData.shirtSizes;

  const set = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Tanzanians, East Africans and residents start with Tanzania as country
      if (name === "nationality") next.country_id = value === "international" ? "" : tanzania?.id ?? "";
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const onInput = (e) => set(e.target.name, e.target.value);

  // participant type follows the age: one possible type is picked for them
  useEffect(() => {
    setForm((prev) => {
      if (allowedCategories.includes(prev.participantCategory)) return prev;
      return { ...prev, participantCategory: allowedCategories.length === 1 ? allowedCategories[0] : "" };
    });
  }, [allowedCategories.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // a size from the other list (adult ↔ kids) no longer applies
  useEffect(() => {
    if (form.shirt_size_id && !sizes.some((s) => String(s.id) === String(form.shirt_size_id))) set("shirt_size_id", "");
  }, [isChild]); // eslint-disable-line react-hooks/exhaustive-deps

  // bring the top of the form into view when the step changes
  useEffect(() => {
    if (moved.current) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, registered]);

  const validate = (index) => {
    const e = {};
    const required = (name, message) => {
      if (!String(form[name] ?? "").trim()) e[name] = message;
    };
    if (index === 0) {
      required("firstName", t("firstNameIsRequired"));
      required("lastName", t("lastNameIsRequired"));
      required("phoneNumber", t("phoneNumberIsRequired"));
      if (form.phoneNumber.trim() && form.phoneNumber.replace(/\D/g, "").length < 9) e.phoneNumber = t("errors.phoneInvalid");
      if (!form.email.trim()) e.email = t("emailIsRequired");
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t("emailIsInvalid");
      if (!form.dateOfBirth) e.dateOfBirth = t("errors.dobRequired");
      else if (ageOnRaceDay(form.dateOfBirth) < 0) e.dateOfBirth = t("errors.dobInvalid");
      required("gender_id", t("errors.genderRequired"));
    }
    if (index === 1) {
      required("event_id", t("eventIsRequired"));
      required("participantCategory", t("participantTypeRequired"));
      required("shirt_size_id", t("shirtSizeIsRequired"));
    }
    if (index === 2) {
      required("nationality", t("errors.nationalityRequired"));
      if (form.nationality) required("country_id", t("errors.countryRequired"));
      required("collection_venue_id", t("collectionVenueIsRequired"));
    }
    if (index === 3) {
      required("emergencyContactName", t("errors.emergencyNameRequired"));
      required("emergencyContactNumber", t("errors.emergencyNumberRequired"));
    }
    return e;
  };

  // after a failed check, put the cursor on the first field with a problem
  const showErrors = (found) => {
    setErrors(found);
    setTimeout(() => cardRef.current?.querySelector('[aria-invalid="true"], fieldset:has(.text-secondary) input')?.focus(), 0);
  };

  const goTo = (index) => {
    moved.current = true;
    setStep(index);
  };

  const next = () => {
    const found = validate(step);
    if (Object.keys(found).length) return showErrors(found);
    setErrors({});
    goTo(step + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    // check every step again; jump back to the first one with a problem
    for (let i = 0; i < STEPS.length; i++) {
      const found = validate(i);
      if (Object.keys(found).length) {
        goTo(i);
        return showErrors(found);
      }
    }

    const saved = await handleRegistration({
      ...form,
      nationality_id: Number(form.country_id),
      gender_id: Number(form.gender_id),
      country_id: Number(form.country_id),
      event_id: Number(form.event_id),
      shirt_size_id: Number(form.shirt_size_id),
      kids_shirt_size_id: isChild ? Number(form.shirt_size_id) : null,
      collection_venue_id: Number(form.collection_venue_id),
      idNumber: local ? form.idOrPassport : "",
      passportNumber: local ? "" : form.idOrPassport,
      postalCode: "",
    });
    if (saved) {
      moved.current = true;
      setRegistered(saved);
      setForm(EMPTY);
      setErrors({});
      setShowVoucher(false);
      setStep(0);
    }
  };

  const byId = (list, id) => list.find((item) => String(item.id) === String(id));
  const event = byId(events, form.event_id);
  const venue = byId(collectionVenues, form.collection_venue_id);
  const fee = form.participantCategory ? categoryFee(form.participantCategory, local) : null;

  const steps = [
    // 1. Personal information
    <div key="personal" className="grid gap-4 sm:grid-cols-2">
      <Field name="firstName" label={tf("firstName")} value={form.firstName} onChange={onInput} error={errors.firstName} autoComplete="given-name" placeholder={tf("enterFirstName")} />
      <Field name="lastName" label={tf("lastName")} value={form.lastName} onChange={onInput} error={errors.lastName} autoComplete="family-name" placeholder={tf("enterLastName")} />
      <Field name="phoneNumber" label={tf("phoneNumber")} value={form.phoneNumber} onChange={onInput} error={errors.phoneNumber} type="tel" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" />
      <Field name="email" label={tf("email")} value={form.email} onChange={onInput} error={errors.email} type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" />
      <Field name="dateOfBirth" label={tf("dateOfBirth")} value={form.dateOfBirth} onChange={onInput} error={errors.dateOfBirth} type="date" max={EVENT.startsAt.slice(0, 10)} autoComplete="bday" />
      <Choices
        name="gender_id"
        legend={tf("gender")}
        value={form.gender_id}
        onChange={set}
        error={errors.gender_id}
        columns="grid-cols-2"
        options={genders.filter((g) => GENDER_CODES.includes(g.code)).map((g) => ({ value: g.id, label: tf(`genders.${g.code}`) }))}
      />
    </div>,

    // 2. Event details
    <div key="event" className="space-y-5">
      <Choices
        name="event_id"
        legend={tf("eventSelection")}
        value={form.event_id}
        onChange={set}
        error={errors.event_id}
        options={events.map((e) => ({ value: e.id, label: e.name }))}
      />
      <div>
        <Choices
          name="participantCategory"
          legend={tf("participantType")}
          value={form.participantCategory}
          onChange={set}
          error={errors.participantCategory}
          columns={allowedCategories.length > 1 ? "sm:grid-cols-3" : ""}
          options={allowedCategories.map((c) => {
            const price = categoryFee(c, local);
            return { value: c, label: tf(`categories.${c}`), hint: tf(`categoryHints.${c}`), aside: formatMoney(price.amount, price.currency) };
          })}
        />
        {allowedCategories.length > 1 && <p className="mt-2 text-xs text-tertiary/70">{tf("proofNote")} {t("foreignShort")}</p>}
      </div>
      <fieldset>
        <Label as="legend">{isChild ? tf("kidsTShirtSize") : tf("tShirtSize")}</Label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const checked = String(form.shirt_size_id) === String(size.id);
            return (
              <label
                key={size.id}
                className={`min-w-12 min-h-11 px-3 rounded-lg border-2 flex items-center justify-center font-bold cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary ${
                  checked ? "border-secondary bg-secondary text-primary" : "border-tertiary/25 text-tertiary hover:border-tertiary/60"
                }`}
              >
                <input type="radio" name={isChild ? "kidsShirtSize" : "shirtSize"} value={size.code} checked={checked} onChange={() => set("shirt_size_id", size.id)} className="sr-only" />
                {size.code}
              </label>
            );
          })}
        </div>
        <ErrorText>{errors.shirt_size_id}</ErrorText>
      </fieldset>
    </div>,

    // 3. Additional information
    <div key="additional" className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <SelectField
          name="nationality"
          label={tf("nationalityCategory")}
          placeholder={tf("selectNationalityCategory")}
          value={form.nationality}
          onChange={onInput}
          error={errors.nationality}
          options={NATIONALITIES.map((n) => ({ value: n, label: t(`nationality.${n}`) }))}
        />
        {form.nationality && <p className="mt-1.5 text-xs text-tertiary/70">{t(`nationalityHints.${form.nationality}`)}</p>}
      </div>
      <SelectField
        name="country_id"
        label={tf("country")}
        placeholder={tf("selectCountry")}
        value={form.country_id}
        onChange={onInput}
        error={errors.country_id}
        options={countries.map((c) => ({ value: c.id, label: c.name }))}
      />
      <Field name="idOrPassport" label={local ? tf("idNumber") : tf("passportNumber")} hint={t("optional")} value={form.idOrPassport} onChange={onInput} />
      <div className="sm:col-span-2">
        <SelectField
          name="collection_venue_id"
          label={tf("collectionVenue")}
          placeholder={tf("selectCollectionVenue")}
          value={form.collection_venue_id}
          onChange={onInput}
          error={errors.collection_venue_id}
          options={collectionVenues.map((v) => ({ value: v.id, label: v.name }))}
        />
        {venue?.address && <p className="mt-1.5 text-xs text-tertiary/70">{venue.address}</p>}
      </div>
    </div>,

    // 4. Emergency contact + summary
    <div key="emergency" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="emergencyContactName" label={tf("emergencyContactName")} value={form.emergencyContactName} onChange={onInput} error={errors.emergencyContactName} autoComplete="off" placeholder={tf("enterEmergencyContactName")} />
        <Field name="emergencyContactNumber" label={tf("emergencyContactNumber")} value={form.emergencyContactNumber} onChange={onInput} error={errors.emergencyContactNumber} type="tel" inputMode="tel" placeholder="07XX XXX XXX" />
      </div>
      {showVoucher ? (
        <Field name="voucherCode" label={tf("voucherCode")} value={form.voucherCode} onChange={onInput} placeholder={tf("enterVoucherCodeIf")} />
      ) : (
        <button type="button" onClick={() => setShowVoucher(true)} className="text-sm font-semibold text-secondary underline underline-offset-4 cursor-pointer">
          {t("haveVoucher")}
        </button>
      )}
      <div className="rounded-xl border border-tertiary/15 bg-tertiary/5 p-4">
        <p className="text-sm text-tertiary/85">
          <span className="font-semibold text-tertiary">{form.firstName} {form.lastName}</span>
          {event && <> · {event.name}</>}
          {byId(sizes, form.shirt_size_id) && <> · T-shirt {byId(sizes, form.shirt_size_id).code}</>}
        </p>
        {fee && (
          <p className="mt-3 pt-3 border-t border-tertiary/15 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-tertiary/80">{t("summary.fee")}</span>
            <span className="text-2xl font-extrabold text-secondary">{formatMoney(fee.amount, fee.currency)}</span>
          </p>
        )}
        <p className="mt-1 text-xs text-tertiary/65">{t("summary.payAfter")}</p>
      </div>
    </div>,
  ];

  const kit = [t("kitTShirt"), t("kitBag"), t("kitBib"), t("kitMedal")];

  return (
    <section id="register" className="py-16 md:py-20 bg-primary overflow-hidden relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary opacity-5 rounded-full -ml-32 -mt-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary opacity-5 rounded-full -mr-48 -mb-48" />

      <div className="max-w-6xl mx-auto px-4 relative">
        <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} tone="dark" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
          {/* What you get */}
          <aside className="text-tertiary lg:sticky lg:top-32">
            <p className="inline-block px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-wider">
              {t("earlyBirdDiscounts")}
            </p>
            <p className="mt-4 text-tertiary/90 leading-relaxed">{t("secureYourSpotIn")}</p>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {kit.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-lg bg-tertiary/10 px-3 py-2.5 text-sm">
                  <FontAwesomeIcon icon={faCheck} className="mt-1 text-secondary text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* The form */}
          <div ref={cardRef} className="rounded-2xl border border-tertiary/15 border-t-4 border-t-secondary bg-tertiary/[0.06] backdrop-blur-sm scroll-mt-32">
            {loading ? (
              <div className="p-10 text-center text-tertiary/80">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                {t("loadingFormOptions")}
              </div>
            ) : loadError ? (
              <p role="alert" className="p-10 text-center font-medium text-secondary">{t("errorLoadingFormOptions")}</p>
            ) : registered ? (
              <div className="p-5 md:p-8">
                <RegistrationConfirmation registration={registered} onRegisterAnother={() => setRegistered(null)} />
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="p-5 md:p-8">
                {/* Progress: numbered steps, done steps can be revisited */}
                <ol className="flex items-center" aria-label={t("progress")}>
                  {STEPS.map((name, i) => (
                    <li key={name} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                      <button
                        type="button"
                        disabled={i >= step}
                        onClick={() => goTo(i)}
                        aria-current={i === step ? "step" : undefined}
                        aria-label={`${i + 1}. ${t(name)}`}
                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors disabled:cursor-default cursor-pointer ${
                          i < step ? "bg-secondary text-primary" : i === step ? "bg-secondary text-primary ring-4 ring-secondary/25" : "bg-tertiary/10 text-tertiary/70"
                        }`}
                      >
                        {i < step ? <FontAwesomeIcon icon={faCheck} /> : i + 1}
                      </button>
                      {i < STEPS.length - 1 && <span className={`flex-1 h-0.5 mx-2 rounded-full ${i < step ? "bg-secondary" : "bg-tertiary/15"}`} />}
                    </li>
                  ))}
                </ol>
                <div className="mt-5 mb-6 flex items-baseline justify-between gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-tertiary">{t(STEPS[step])}</h3>
                  <span className="shrink-0 text-xs font-semibold text-tertiary/60">{t("stepOf", { current: step + 1, total: STEPS.length })}</span>
                </div>

                {(apiError || retryAfter) && (
                  <p role="alert" className="mb-5 flex gap-2 rounded-lg border border-secondary/40 bg-secondary/10 text-secondary px-4 py-3 text-sm font-medium">
                    <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5" />
                    {retryAfter ? t("tooMany", { minutes: Math.ceil(retryAfter / 60) }) : t("errors.submitFailed")}
                  </p>
                )}

                {steps[step]}

                <div className="mt-8 flex gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => goTo(step - 1)}
                      className="min-h-12 px-5 rounded-lg border-2 border-tertiary/30 text-tertiary font-semibold inline-flex items-center justify-center gap-2 hover:border-secondary hover:text-secondary cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      <span className="sr-only sm:not-sr-only">{t("back")}</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(retryAfter)}
                    className="flex-1 min-h-12 px-5 rounded-lg bg-secondary text-primary font-bold uppercase tracking-wide text-sm inline-flex items-center justify-center gap-2 hover:bg-tertiary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> {t("processing")}
                      </>
                    ) : step === STEPS.length - 1 ? (
                      t("completeRegistration")
                    ) : (
                      <>
                        {t("next")} <FontAwesomeIcon icon={faArrowRight} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;
