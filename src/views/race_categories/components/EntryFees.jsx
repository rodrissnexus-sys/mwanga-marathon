"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { CATEGORY_FEES, FOREIGN_FEE, PARTICIPANT_CATEGORIES, formatMoney } from '@/lib/payments';

// 2026 entry fees by participant type (the same for every race).
const EntryFees = () => {
  const t = useTranslations("raceCategories.fees");
  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-center text-lg text-primary/80 mb-8">{t("intro")}</p>
      <div className="rounded-2xl overflow-hidden shadow-lg border border-primary/10 bg-tertiary">
        <table className="w-full text-left">
          <tbody className="divide-y divide-primary/10">
            {PARTICIPANT_CATEGORIES.map((category) => (
              <tr key={category}>
                <th scope="row" className="px-5 py-4 align-top">
                  <span className="block font-bold text-primary">{t(`rows.${category}.who`)}</span>
                  <span className="block text-sm font-normal text-primary/75">{t(`rows.${category}.detail`)}</span>
                </th>
                <td className="px-5 py-4 text-right align-top">
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary text-primary font-extrabold whitespace-nowrap">
                    {formatMoney(CATEGORY_FEES[category], 'TZS')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-4 bg-primary text-tertiary text-sm">
          {t("foreign", {
            foreignFee: formatMoney(FOREIGN_FEE.amount, FOREIGN_FEE.currency),
            childFee: formatMoney(CATEGORY_FEES.child, 'TZS'),
          })}
        </p>
      </div>
    </div>
  );
};

export default EntryFees;
