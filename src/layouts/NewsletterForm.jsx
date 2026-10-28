"use client";

import React, { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { subscribeToNewsletter } from "@/server/newsletter";

// Footer sign-up box: email field and a joined lime button of the same height.
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
      <div className="flex h-12 rounded-lg overflow-hidden ring-1 ring-tertiary/30 focus-within:ring-2 focus-within:ring-secondary bg-tertiary/10">
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
          className="flex-1 min-w-0 h-full px-4 bg-transparent text-tertiary placeholder:text-tertiary/70 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          aria-label={t("subscribe")}
          className="h-full px-5 flex items-center gap-2 bg-secondary text-primary font-bold hover:bg-tertiary transition-colors cursor-pointer disabled:opacity-70"
        >
          <span className="hidden sm:inline">{t("subscribe")}</span>
          <FontAwesomeIcon icon={status === "sending" ? faSpinner : faArrowRight} spin={status === "sending"} />
        </button>
      </div>
      {status === "error" && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-secondary">{error}</p>
      )}
    </form>
  );
};

export default NewsletterForm;
