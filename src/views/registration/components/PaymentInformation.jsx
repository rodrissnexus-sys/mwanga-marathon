"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faCopy, faCheck, faEnvelope, faBuildingColumns, faMobileScreen, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import SectionHeader from "../../../components/common/SectionHeader";

// One M-Pesa Lipa Namba takes payments from every network and bank (TIPS),
// as on the organisers' "Pesa ni M-Pesa" table talker.
const LIPA_NAMBA = "58136742";
const QR = "/assets/payment/lipa-namba-qr.png";
const NETWORKS = [
  { key: "mpesa", accent: "bg-[#e60000]" },
  { key: "mixx", accent: "bg-[#00377b]" },
  { key: "airtel", accent: "bg-[#ed1c24]" },
  { key: "other", accent: "bg-primary" },
];
const BANKS = [
  ["Mwanga Hakika Bank", "2290060000001"],
  ["CRDB", "015C948979800"],
  ["TCB", "215404000076"],
];

const PaymentInformation = () => {
  const t = useTranslations("register.payment");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LIPA_NAMBA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the number is on screen anyway */
    }
  };

  return (
    <section id="payment" className="py-16 md:py-20 bg-gradient-to-b from-tertiary to-primary/5">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} className="!mb-6" />
        <p className="text-center text-primary/80 max-w-2xl mx-auto mb-10">{t("intro")}</p>

        {/* The one number to pay to, plus the QR code */}
        <div className="rounded-3xl bg-primary text-tertiary overflow-hidden shadow-xl grid md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{t("lipaNamba")}</p>
            <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-wider tabular-nums">{LIPA_NAMBA}</p>
            <p className="mt-2 font-semibold text-tertiary/85">{t("merchant")}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-full bg-secondary text-primary font-bold hover:bg-secondary/90"
                aria-live="polite"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? t("copied") : t("copy")}
              </button>
              <a
                href="tel:*150*00%23"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-full border border-tertiary/40 font-semibold hover:border-secondary md:hidden"
              >
                <FontAwesomeIcon icon={faPhone} /> {t("dial", { code: "*150*00#" })}
              </a>
            </div>
          </div>
          <div className="bg-tertiary/[0.06] border-t md:border-t-0 md:border-l border-tertiary/15 p-6 md:p-8 flex flex-row md:flex-col items-center gap-5 md:max-w-[280px]">
            <img src={QR} alt={`QR: Lipa Namba ${LIPA_NAMBA}`} width={180} height={180} className="w-28 h-28 md:w-44 md:h-44 rounded-xl bg-tertiary p-1.5 shrink-0" />
            <div className="md:text-center">
              <p className="font-bold text-secondary">{t("scanTitle")}</p>
              <p className="mt-1 text-sm text-tertiary/80 leading-relaxed">{t("scanText")}</p>
            </div>
          </div>
        </div>

        {/* Step by step for each network */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {NETWORKS.map(({ key, accent }) => {
            const code = t(`networks.${key}.code`);
            return (
              <div key={key} className="rounded-2xl bg-tertiary border border-primary/10 shadow-sm overflow-hidden flex flex-col">
                <div className={`h-1.5 ${accent}`} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-primary text-secondary flex items-center justify-center">
                      <FontAwesomeIcon icon={key === "other" ? faBuildingColumns : faMobileScreen} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary leading-tight">{t(`networks.${key}.name`)}</h3>
                      {code && <p className="text-sm font-mono font-semibold text-primary/70">{code}</p>}
                    </div>
                  </div>
                  <ol className="mt-4 space-y-2.5">
                    {t.raw(`networks.${key}.steps`).map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm text-primary/85 leading-6">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="min-w-0">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {code && (
                    <a href={`tel:${code.replace(/#/g, "%23")}`} className="mt-auto pt-5 group">
                      <span className="flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-primary/20 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-tertiary group-hover:border-primary transition-colors">
                        <FontAwesomeIcon icon={faPhone} /> {t("dial", { code })}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bank accounts + what to do after paying */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-tertiary border border-primary/10 shadow-sm p-6">
            <h3 className="flex items-center gap-2 font-bold text-primary text-lg">
              <FontAwesomeIcon icon={faBuildingColumns} className="text-primary/70" /> {t("bankTitle")}
            </h3>
            <p className="mt-1 text-sm text-primary/75">{t("bankText")}</p>
            <dl className="mt-4 divide-y divide-primary/10 rounded-xl bg-primary/[0.04]">
              {BANKS.map(([bank, account]) => (
                <div key={bank} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
                  <dt className="text-sm text-primary/75">{bank}</dt>
                  <dd className="font-mono font-bold text-primary tracking-wide">{account}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm font-semibold text-primary">{t("accountName")}</p>
          </div>

          <div className="rounded-2xl bg-primary text-tertiary p-6">
            <h3 className="flex items-center gap-2 font-bold text-lg">
              <FontAwesomeIcon icon={faCircleInfo} className="text-secondary" /> {t("afterTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              {t.raw("after").map((line) => (
                <li key={line} className="flex gap-3 text-sm text-tertiary/90 leading-6">
                  <FontAwesomeIcon icon={faCheck} className="text-secondary mt-1.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:info@mwafem.com?subject=Mwanga%20Marathon%202026%20payment"
              className="mt-6 inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-full bg-secondary text-primary font-bold w-full sm:w-auto"
            >
              <FontAwesomeIcon icon={faEnvelope} /> {t("sendSlip")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentInformation;
