"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faLocationDot, faFlagCheckered } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import HeroSection from '../../components/common/HeroSection';
import SectionHeader from '../../components/common/SectionHeader';
import GeneralContactForm from '../../components/forms/GeneralContactForm';

const SOCIALS = [
  { icon: faInstagram, label: 'Instagram', url: 'https://www.instagram.com/mwangafestivalandmarathon/' },
  { icon: faFacebook, label: 'Facebook', url: 'https://web.facebook.com/profile.php?id=61566560950056' },
  { icon: faTiktok, label: 'TikTok', url: 'https://www.tiktok.com/@mwangamarathonfestival' },
];

const InfoCard = ({ icon, title, children }) => (
  <div className="flex gap-4 p-5 bg-tertiary rounded-xl shadow-sm border border-primary/10">
    <div className="w-11 h-11 shrink-0 rounded-lg bg-primary text-secondary flex items-center justify-center">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className="min-w-0">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      <div className="text-text-primary/80 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
);

const Contact = () => {
  const t = useTranslations('contact');
  const hero = useTranslations('hero').raw('contact');

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-primary/5">
      <HeroSection title={hero.title} subtitle={hero.subtitle} backgroundImage="/assets/images/handshake.jpg" />

      <section className="py-20 relative overflow-hidden" id="contact">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <SectionHeader firstWord={t('titleFirst')} secondWord={t('titleSecond')} />

          <div className="grid gap-10 lg:grid-cols-5 mt-12">
            {/* Details */}
            <div className="lg:col-span-2 space-y-4">
              <InfoCard icon={faPhone} title={t('phone')}>
                <a href="tel:+255755002886" className="block hover:text-primary">+255 755 002 886</a>
                <a href="tel:+255783292929" className="block hover:text-primary">+255 783 292 929</a>
              </InfoCard>
              <InfoCard icon={faEnvelope} title={t('email')}>
                <a href="mailto:info@mwafem.com" className="hover:text-primary break-words">info@mwafem.com</a>
              </InfoCard>
              <InfoCard icon={faLocationDot} title={t('office')}>
                Plot No. 48, Block No. 21 Colonel Middleton Rd, Arusha
                <br />
                {t('officeName')} · {t('poBox')}
              </InfoCard>
              <InfoCard icon={faFlagCheckered} title={t('venue')}>
                {t('venueText')}
              </InfoCard>
              <div className="p-5 bg-primary rounded-xl">
                <h3 className="font-semibold text-tertiary mb-3">{t('follow')}</h3>
                <div className="flex gap-3">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-11 h-11 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
                    >
                      <FontAwesomeIcon icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 p-6 md:p-8 bg-tertiary rounded-2xl shadow-md border border-primary/10">
              <h2 className="text-2xl font-semibold text-primary mb-2">{t('formTitle')}</h2>
              <p className="text-text-primary/70 mb-6">{t('formText')}</p>
              <GeneralContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
