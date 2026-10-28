"use client";

import { useTranslations } from "next-intl";
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPersonRunning,
  faPeopleGroup,
  faDrum,
  faMountainSun,
  faHandsHolding,
  faBowlFood,
  faChalkboardUser,
  faSeedling,
  faChildren,
  faStore,
  faMasksTheater,
  faCheck,
  faTree,
  faBabyCarriage,
  faBullhorn,
} from '@fortawesome/free-solid-svg-icons';
import SectionHeader from '../../../components/common/SectionHeader';

// Programme and community work from the organiser's 2026 letters.
// Icons follow the order of about.programme.items / community in messages.
const ITEM_ICONS = [faPersonRunning, faPeopleGroup, faDrum, faMountainSun, faHandsHolding, faBowlFood, faChalkboardUser, faSeedling, faChildren, faStore, faMasksTheater];
const COMMUNITY_ICONS = [faTree, faBabyCarriage, faBullhorn];

const FestivalProgrammeSection = () => {
  const t = useTranslations("about.programme");
  const items = t.raw("items");
  const community = t.raw("community");
  const kit = t.raw("package");

  return (
    <div className="mb-20">
      <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />
      <p className="text-center text-lg text-primary/80 max-w-3xl mx-auto -mt-8 mb-10">{t("intro")}</p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.title} className="flex gap-4 p-5 rounded-2xl bg-tertiary border border-primary/10 shadow-sm">
            <span className="w-11 h-11 shrink-0 rounded-xl bg-primary text-secondary flex items-center justify-center">
              <FontAwesomeIcon icon={ITEM_ICONS[index] ?? faCheck} />
            </span>
            <span>
              <span className="block font-bold text-primary">{item.title}</span>
              <span className="block text-sm text-primary/80 mt-1">{item.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-5 mt-10">
        <div className="lg:col-span-2 rounded-2xl bg-secondary p-6 text-primary">
          <h3 className="text-xl font-extrabold mb-4">{t("packageTitle")}</h3>
          <ul className="space-y-3">
            {kit.map((line) => (
              <li key={line} className="flex gap-3 font-semibold">
                <FontAwesomeIcon icon={faCheck} className="mt-1" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-primary p-6 text-tertiary">
          <h3 className="text-xl font-extrabold mb-4">{t("communityTitle")}</h3>
          <ul className="space-y-4">
            {community.map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-full bg-tertiary/10 text-secondary flex items-center justify-center">
                  <FontAwesomeIcon icon={COMMUNITY_ICONS[index] ?? faCheck} />
                </span>
                <span>
                  <span className="block font-bold">{item.title}</span>
                  <span className="block text-sm text-tertiary/85 mt-0.5">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figure className="mt-10 text-center max-w-3xl mx-auto">
        <blockquote lang="sw" className="text-xl md:text-2xl font-extrabold text-primary leading-snug">{t("slogan")}</blockquote>
        {t("sloganTranslation") && <figcaption className="mt-2 text-primary/75 italic">{t("sloganTranslation")}</figcaption>}
      </figure>
    </div>
  );
};

export default FestivalProgrammeSection;
