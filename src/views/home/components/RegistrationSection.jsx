"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faCircleInfo, faSpinner } from "@fortawesome/free-solid-svg-icons";
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
  nationality: "",
  country_id: "",
  idOrPassport: "",
  event_id: "",
  participantCategory: "",
  shirt_size_id: "",
  collection_venue_id: "",
  voucherCode: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
};

const NATIONALITIES = ["tz_ea", "tz_resident_sadc", "international"];
const STEPS = ["aboutYou", "yourRace", "confirm"];

const inputClass = (error) =>
  `w-full min-h-12 px-4 scroll-mt-36 rounded-lg border bg-tertiary text-primary placeholder:text-primary/45 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-primary ${
    error ? "border-negative" : "border-primary/25"
  }`;

// Text input with its label and error message.
const Field = ({ name, label, error, optional, optionalText, ...props }) => (
  <div>
    <label htmlFor={`reg-${name}`} className="block text-sm font-semibold text-primary mb-1.5">
      {label} {optional && <span className="font-normal text-primary/60">({optionalText})</span>}
    </label>
    <input
      id={`reg-${name}`}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `reg-${name}-error` : undefined}
      className={inputClass(error)}
      {...props}
    />
    {error && <p id={`reg-${name}-error`} className="mt-1 text-sm font-medium text-negative">{error}</p>}
  </div>
);

// A group of tap-to-choose cards (radio buttons underneath).
const Choices = ({ name, legend, value, onChange, options, error, columns = "sm:grid-cols-2" }) => (
  <fieldset>
    <legend className="block text-sm font-semibold text-primary mb-1.5">{legend}</legend>
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const checked = String(value) === String(option.value);
        return (
          <label
            key={option.value}
            className={`relative flex items-start gap-3 p-3 min-h-12 rounded-lg border cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary ${
              checked ? "border-primary bg-secondary/25" : "border-primary/20 hover:border-primary/50"
            }`}
          >
            <input type="radio" name={name} value={option.value} checked={checked} onChange={() => onChange(name, option.value)} className="sr-only" />
            <span
              aria-hidden="true"
              className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${checked ? "border-primary bg-primary text-secondary" : "border-primary/35"}`}
            >
              {checked && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold text-primary">{option.label}</span>
                {option.aside && <span className="font-bold text-primary">{option.aside}</span>}
              </span>
              {option.hint && <span className="block text-sm text-primary/70 mt-0.5">{option.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
    {error && <p className="mt-1 text-sm font-medium text-negative">{error}</p>}
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
      required("nationality", t("errors.nationalityRequired"));
      if (form.nationality) required("country_id", t("errors.countryRequired"));
    }
    if (index === 1) {
      required("event_id", t("eventIsRequired"));
      required("participantCategory", t("participantTypeRequired"));
      required("shirt_size_id", t("shirtSizeIsRequired"));
      required("collection_venue_id", t("collectionVenueIsRequired"));
    }
    if (index === 2) {
      required("emergencyContactName", t("errors.emergencyNameRequired"));
      required("emergencyContactNumber", t("errors.emergencyNumberRequired"));
    }
    return e;
  };

  // after a failed check, put the cursor on the first field with a problem
  const showErrors = (found) => {
    setErrors(found);
    setTimeout(() => cardRef.current?.querySelector('[aria-invalid="true"], fieldset:has(.text-negative) input')?.focus(), 0);
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

  const optional = { optional: true, optionalText: t("optional") };

  const steps = [
    // 1. About you
    <div key="about" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="firstName" label={tf("firstName")} value={form.firstName} onChange={onInput} error={errors.firstName} autoComplete="given-name" />
        <Field name="lastName" label={tf("lastName")} value={form.lastName} onChange={onInput} error={errors.lastName} autoComplete="family-name" />
        <Field name="phoneNumber" label={tf("phoneNumber")} value={form.phoneNumber} onChange={onInput} error={errors.phoneNumber} type="tel" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" />
        <Field name="email" label={tf("email")} value={form.email} onChange={onInput} error={errors.email} type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" />
        <Field name="dateOfBirth" label={tf("dateOfBirth")} value={form.dateOfBirth} onChange={onInput} error={errors.dateOfBirth} type="date" max={EVENT.startsAt.slice(0, 10)} autoComplete="bday" />
      </div>
      <Choices
        name="gender_id"
        legend={tf("gender")}
        value={form.gender_id}
        onChange={set}
        error={errors.gender_id}
        columns="grid-cols-2 sm:grid-cols-4"
        options={genders.map((g) => ({ value: g.id, label: g.name }))}
      />
      <Choices
        name="nationality"
        legend={tf("nationalityCategory")}
        value={form.nationality}
        onChange={set}
        error={errors.nationality}
        columns=""
        options={NATIONALITIES.map((n) => ({ value: n, label: t(`nationality.${n}`), hint: t(`nationalityHints.${n}`) }))}
      />
      {form.nationality && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-country_id" className="block text-sm font-semibold text-primary mb-1.5">{tf("country")}</label>
            <select
              id="reg-country_id"
              name="country_id"
              value={form.country_id}
              onChange={onInput}
              aria-invalid={errors.country_id ? true : undefined}
              className={`${inputClass(errors.country_id)} cursor-pointer`}
            >
              <option value="">{tf("selectCountry")}</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.country_id && <p className="mt-1 text-sm font-medium text-negative">{errors.country_id}</p>}
          </div>
          <Field
            name="idOrPassport"
            label={local ? tf("idNumber") : tf("passportNumber")}
            value={form.idOrPassport}
            onChange={onInput}
            {...optional}
          />
        </div>
      )}
    </div>,

    // 2. Your race
    <div key="race" className="space-y-6">
      <Choices
        name="event_id"
        legend={tf("eventSelection")}
        value={form.event_id}
        onChange={set}
        error={errors.event_id}
        options={events.map((e) => ({ value: e.id, label: e.name, hint: e.description }))}
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
        {allowedCategories.length > 1 && <p className="mt-2 text-sm text-primary/70">{tf("proofNote")}</p>}
      </div>
      <fieldset>
        <legend className="block text-sm font-semibold text-primary mb-1.5">{isChild ? tf("kidsTShirtSize") : tf("tShirtSize")}</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const checked = String(form.shirt_size_id) === String(size.id);
            return (
              <label
                key={size.id}
                className={`min-w-14 min-h-12 px-4 rounded-lg border flex items-center justify-center font-bold cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary ${
                  checked ? "border-primary bg-primary text-secondary" : "border-primary/25 text-primary hover:border-primary/60"
                }`}
              >
                <input type="radio" name={isChild ? "kidsShirtSize" : "shirtSize"} value={size.code} checked={checked} onChange={() => set("shirt_size_id", size.id)} className="sr-only" />
                {size.code}
              </label>
            );
          })}
        </div>
        {errors.shirt_size_id && <p className="mt-1 text-sm font-medium text-negative">{errors.shirt_size_id}</p>}
      </fieldset>
      <Choices
        name="collection_venue_id"
        legend={tf("collectionVenue")}
        value={form.collection_venue_id}
        onChange={set}
        error={errors.collection_venue_id}
        options={collectionVenues.map((v) => ({ value: v.id, label: v.name, hint: v.address }))}
      />
      {showVoucher ? (
        <Field name="voucherCode" label={tf("voucherCode")} value={form.voucherCode} onChange={onInput} placeholder={tf("enterVoucherCodeIf")} />
      ) : (
        <button type="button" onClick={() => setShowVoucher(true)} className="text-sm font-semibold text-primary underline underline-offset-4 cursor-pointer">
          {t("haveVoucher")}
        </button>
      )}
    </div>,

    // 3. Emergency contact + summary
    <div key="confirm" className="space-y-6">
      <div>
        <p className="text-sm text-primary/75 mb-3">{t("emergencyText")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="emergencyContactName" label={tf("emergencyContactName")} value={form.emergencyContactName} onChange={onInput} error={errors.emergencyContactName} autoComplete="off" />
          <Field name="emergencyContactNumber" label={tf("emergencyContactNumber")} value={form.emergencyContactNumber} onChange={onInput} error={errors.emergencyContactNumber} type="tel" inputMode="tel" placeholder="07XX XXX XXX" />
        </div>
      </div>
      <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-4 md:p-5">
        <h4 className="font-bold text-primary mb-3">{t("summary.title")}</h4>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
          {[
            [t("summary.name"), `${form.firstName} ${form.lastName}`],
            [t("summary.race"), event?.name],
            [t("summary.type"), form.participantCategory ? tf(`categories.${form.participantCategory}`) : ""],
            [t("summary.size"), byId(sizes, form.shirt_size_id)?.code],
            [t("summary.venue"), venue?.name],
            [t("summary.phone"), form.phoneNumber],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-wide text-primary/60">{label}</dt>
              <dd className="font-semibold text-primary break-words">{value || "—"}</dd>
            </div>
          ))}
        </dl>
        {fee && (
          <p className="mt-4 pt-4 border-t border-primary/10 flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold text-primary/80">{t("summary.fee")}</span>
            <span className="text-2xl font-extrabold text-primary">{formatMoney(fee.amount, fee.currency)}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-primary/65">{t("summary.payAfter")}</p>
      </div>
    </div>,
  ];

  const kit = [t("kitTShirt"), t("kitBag"), t("kitBib"), t("kitMedal")];

  return (
    <section id="register" className="py-16 md:py-20 bg-primary overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 relative">
        <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} tone="dark" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
          {/* What you get */}
          <aside className="text-tertiary lg:sticky lg:top-32">
            <p className="inline-block px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-wider">
              {t("earlyBirdDiscounts")}
            </p>
            <p className="mt-4 text-tertiary/90 leading-relaxed">{t("secureYourSpotIn")}</p>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-secondary">{t("kitTitle")}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {kit.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-lg bg-tertiary/10 px-3 py-2.5 text-sm">
                  <FontAwesomeIcon icon={faCheck} className="mt-1 text-secondary text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* The form */}
          <div ref={cardRef} className="rounded-2xl bg-tertiary text-primary shadow-2xl overflow-hidden scroll-mt-32">
            {loading ? (
              <div className="p-10 text-center text-primary/75">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                {t("loadingFormOptions")}
              </div>
            ) : loadError ? (
              <p role="alert" className="p-10 text-center font-medium text-negative">{t("errorLoadingFormOptions")}</p>
            ) : registered ? (
              <div className="bg-primary p-5 md:p-8">
                <RegistrationConfirmation registration={registered} onRegisterAnother={() => setRegistered(null)} />
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                {/* Progress */}
                <div className="px-5 md:px-8 pt-5 md:pt-6">
                  <ol className="grid grid-cols-3 gap-2" aria-label={t("progress")}>
                    {STEPS.map((name, i) => (
                      <li key={name}>
                        <button
                          type="button"
                          disabled={i >= step}
                          onClick={() => goTo(i)}
                          aria-current={i === step ? "step" : undefined}
                          className="w-full text-left disabled:cursor-default cursor-pointer"
                        >
                          <span className={`block h-1.5 rounded-full ${i <= step ? "bg-secondary" : "bg-primary/10"}`} />
                          <span className={`mt-2 flex items-start gap-1.5 text-xs font-semibold ${i === step ? "text-primary" : "text-primary/55"}`}>
                            <span
                              className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                i < step ? "bg-primary text-secondary" : i === step ? "bg-secondary text-primary" : "bg-primary/10 text-primary/60"
                              }`}
                            >
                              {i < step ? <FontAwesomeIcon icon={faCheck} /> : i + 1}
                            </span>
                            <span className="leading-tight">{t(`steps.${name}`)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                  <h3 className="mt-5 text-xl md:text-2xl font-extrabold text-primary">{t(`steps.${STEPS[step]}`)}</h3>
                  <p className="text-sm text-primary/60">{t("stepOf", { current: step + 1, total: STEPS.length })}</p>
                </div>

                <div className="px-5 md:px-8 py-6">
                  {(apiError || retryAfter) && (
                    <p role="alert" className="mb-5 flex gap-3 rounded-lg border border-negative/30 bg-negative/10 text-negative px-4 py-3 text-sm font-medium">
                      <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5" />
                      {retryAfter ? t("tooMany", { minutes: Math.ceil(retryAfter / 60) }) : t("errors.submitFailed")}
                    </p>
                  )}
                  {steps[step]}
                </div>

                <div className="px-5 md:px-8 pb-6 flex gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => goTo(step - 1)}
                      className="min-h-12 px-5 rounded-lg border border-primary/25 text-primary font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/5 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      <span className="sr-only sm:not-sr-only">{t("back")}</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(retryAfter)}
                    className={`flex-1 min-h-12 px-5 rounded-lg font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      step === STEPS.length - 1 ? "bg-secondary text-primary" : "bg-primary text-tertiary hover:bg-primary/90"
                    }`}
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
