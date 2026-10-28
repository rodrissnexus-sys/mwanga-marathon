"use client";

import React, { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { subscribeToNewsletter } from "@/server/newsletter";

// Footer sign-up box: email field with a full-width lime button below it.
const NewsletterForm = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    const result = await subscribeToNewsletter(email, locale).catch(() => ({ success: false, error: "failed" }));
    if (result.success) {
      setStatus("done");
      setEmail("");
    } else {
      setStatus("error");
      setError(t(`newsletterErrors.${result.error}`));
    }
  };

  if (status === "done") {
    return (
      <p role="status" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary text-primary font-semibold">
        <FontAwesomeIcon icon={faCheck} />
        {t("newsletterThanks")}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={id} className="block text-sm text-tertiary/85 mb-2">{t("newsletterText")}</label>
      {/* field and button stacked: both full width, so the button always has room for its label */}
      <div className="space-y-2">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={t("emailPlaceholder")}
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? `${id}-error` : undefined}
          className="w-full h-12 px-4 rounded-lg bg-tertiary/10 ring-1 ring-tertiary/30 text-tertiary placeholder:text-tertiary/70 focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full h-12 px-4 rounded-lg flex items-center justify-center gap-2 bg-secondary text-primary font-bold uppercase tracking-wide text-sm hover:bg-tertiary transition-colors cursor-pointer disabled:opacity-70 group"
        >
          {t("subscribe")}
          <FontAwesomeIcon
            icon={status === "sending" ? faSpinner : faArrowRight}
            spin={status === "sending"}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
      {status === "error" && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-secondary">{error}</p>
      )}
    </form>
  );
};

export default NewsletterForm;
