import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "@/i18n/navigation";

// Date of the current version of both documents.
const UPDATED = "2026-10-28";

/**
 * Privacy Policy and Terms and Conditions: the text lives in
 * messages/<locale>/legal.json (`privacy` / `terms`), as numbered sections
 * with paragraphs and bullet lists.
 */
const Legal = ({ doc }) => {
  const t = useTranslations("legal");
  const locale = useLocale();
  const sections = t.raw(`${doc}.sections`);
  const other = doc === "privacy" ? "terms" : "privacy";
  const updated = new Date(UPDATED).toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">
      {/* Title band */}
      <header className="bg-primary text-tertiary pt-36 pb-12 md:pt-40 md:pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="inline-block px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-wider">
            {t("updated", { date: updated })}
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">{t(`${doc}.title`)}</h1>
          <span aria-hidden="true" className="block mt-4 w-20 h-1 rounded-full bg-secondary" />
          <p className="mt-6 max-w-3xl text-tertiary/85 md:text-lg leading-relaxed">{t(`${doc}.intro`)}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] items-start">
        {/* Contents */}
        <nav aria-label={t("contents")} className="hidden lg:block sticky top-32">
          <p className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-3">{t("contents")}</p>
          <ol className="space-y-1 border-l-2 border-primary/10">
            {sections.map((section, i) => (
              <li key={section.title}>
                <a href={`#section-${i + 1}`} className="block -ml-0.5 pl-4 py-1.5 border-l-2 border-transparent text-sm text-primary/75 hover:text-primary hover:border-secondary">
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          <article className="space-y-10">
            {sections.map((section, i) => (
              <section key={section.title} id={`section-${i + 1}`} className="scroll-mt-32">
                <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-primary">
                  <span className="w-9 h-9 shrink-0 rounded-lg bg-primary text-secondary text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
                  {section.title}
                </h2>
                <div className="mt-4 md:pl-12 space-y-3 text-primary/85 leading-relaxed">
                  {section.paragraphs?.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                  {section.items && (
                    <ul className="space-y-2.5">
                      {section.items.map((text) => (
                        <li key={text} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2.5 w-1.5 h-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </article>

          {/* Questions + the other document */}
          <div className="mt-14 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl bg-primary text-tertiary p-6 md:p-8">
              <h2 className="text-xl font-bold">{t("questionsTitle")}</h2>
              <p className="mt-1 text-tertiary/80">{t("questionsText")}</p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <a href="mailto:info@mwafem.com" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg bg-secondary text-primary font-bold">
                  <FontAwesomeIcon icon={faEnvelope} /> info@mwafem.com
                </a>
                <a href="tel:+255755002886" className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg border border-tertiary/40 font-semibold hover:border-secondary">
                  <FontAwesomeIcon icon={faPhone} /> +255 755 002 886
                </a>
              </div>
            </div>
            <Link
              href={`/${other}`}
              className="group rounded-2xl border border-primary/15 bg-tertiary p-6 md:p-8 flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-primary/60">{t("alsoRead")}</span>
              <span className="flex items-center justify-between gap-3 text-xl font-bold text-primary">
                {t(`${other}Link`)}
                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
