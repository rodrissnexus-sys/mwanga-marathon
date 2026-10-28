import React from "react";
import SectionHeader from '@/components/common/SectionHeader';
import NewsletterForm from './NewsletterForm';
import { getTranslations } from "next-intl/server";
import { Link } from '@/lib/router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";

async function getCurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

const Footer = async () => {
  const t = await getTranslations("footer");
  const year = await getCurrentYear();
  return (
    <footer className="py-20 bg-primary text-tertiary overflow-hidden relative">
      {/* Subtle background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary opacity-5 rounded-full -ml-48 -mb-48"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header with consistent styling from highlight section */}
        <SectionHeader firstWord={t("connect")} secondWord={t("withUs")} tone="dark" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About column */}
          <div className="group">
            <div className="transform transition-all duration-300 group-hover:translate-x-2">
              <div className="text-2xl font-bold mb-4">
                <span className="text-tertiary">
                  Mwanga Festival and Marathon {year}
                </span>
              </div>
              <p className="mt-2 text-tertiary/80">
                {t("tagline")}
              </p>
            </div>
          </div>

          {/* Quick Links column */}
          <div className="group">
            <div className="transform transition-all duration-300 group-hover:translate-x-2">
              <h3 className="text-xl font-semibold mb-4 text-tertiary">
                {t("quickLinks")}
              </h3>
              <ul className="space-y-3">
                {[
                  { name: t("links.about"), path: "/about" },
                  { name: t("links.events"), path: "/events" },
                  { name: t("links.register"), path: "/register" },
                  { name: t("links.status"), path: "/registration-status" },
                  { name: t("links.raceDay"), path: "/race-day" },
                  { name: t("links.visit"), path: "/visit" },
                  { name: t("links.volunteer"), path: "/volunteer" },
                  { name: t("links.contact"), path: "/contact" },
                  { name: t("links.sponsors"), path: "/sponsors" },
                  { name: t("links.faqs"), path: "/race-categories#faq" }
                ].map(
                  (link) => (
                    <li key={link.name} className="flex items-center group">
                      <span className="inline-block w-0 h-4 bg-secondary mr-0 transition-all duration-300 group-hover:w-1 group-hover:mr-2"></span>
                      <Link
                        to={link.path}
                        className="text-tertiary/80 hover:text-secondary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Contact column */}
          <div className="group">
            <div className="transform transition-all duration-300 group-hover:translate-x-2">
              <h3 className="text-xl font-semibold mb-4 text-tertiary">
                {t("contact")}
              </h3>
              <ul className="space-y-3 text-tertiary/80">
                <li className="flex items-start">
                  <div className="h-6 w-6 mr-2 text-secondary flex-shrink-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="h-6 w-6" />
                  </div>
                  <span>Plot No. 48, Block No. 21 Colonel Middleton Rd, Arusha <b>{t("officeNote")}</b></span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 mr-2 text-secondary flex-shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6" />
                  </div>
                  <span>info@mwafem.com</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 mr-2 text-secondary flex-shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="h-6 w-6" />
                  </div>
                  <span>+255 755 002 886</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Connect column */}
          <div className="group">
            <div className="transform transition-all duration-300 group-hover:translate-x-2">
              <h3 className="text-xl font-semibold mb-4 text-tertiary">
                {t("social")}
              </h3>
              <div className="flex gap-3">
                {[
                  {
                    icon: faInstagram,
                    name: "Instagram",
                    url: "https://www.instagram.com/mwangafestivalandmarathon/"
                  },
                  {
                    icon: faFacebook,
                    name: "Facebook",
                    url: "https://web.facebook.com/profile.php?id=61566560950056"
                  },
                  {
                    icon: faTiktok,
                    name: "TikTok",
                    url: "https://www.tiktok.com/@mwangamarathonfestival"
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="h-11 w-11 flex items-center justify-center rounded-full bg-tertiary/10 ring-1 ring-tertiary/25 text-tertiary hover:bg-secondary hover:ring-secondary hover:text-primary hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={social.icon} className="text-lg" />
                  </a>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 text-tertiary">{t("newsletter")}</h3>
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 text-center relative">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-secondary"></div>
          <p className="text-tertiary/50">
            {t("rights", { year })}
          </p>
          <p className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/privacy" className="text-tertiary/75 hover:text-secondary underline-offset-4 hover:underline">{t("legal.privacy")}</Link>
            <Link to="/terms" className="text-tertiary/75 hover:text-secondary underline-offset-4 hover:underline">{t("legal.terms")}</Link>
          </p>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-tertiary"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-tertiary"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-tertiary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-tertiary"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;