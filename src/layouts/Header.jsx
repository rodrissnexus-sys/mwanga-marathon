"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useNavigate, useLocation, Link } from '@/lib/router';
import { usePathname, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import PrimaryButton from "../components/common/buttons/PrimaryButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faHome, faCalendar, faEnvelope, faGift, faInfoCircle, faHighlighter, faRunning, faGlobe, faChevronDown, faPhone, faMapMarkerAlt, faBars, faXmark, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const GradientButton = ({ children, onClick, className = '', gradientFrom = 'from-secondary/80', gradientTo = 'to-secondary', to, compact = false }) => {
  const ButtonContent = (
    <PrimaryButton 
      onClick={onClick}
      className={`group ${className}`}
      compact={compact}
    >
      <span className="relative z-10 text-primary font-semibold">
        {children}
      </span>
      
      {/* Base gradient background */}
      <span className={`absolute inset-0 w-full h-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`}></span>
      
      {/* Hover gradient overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-0"></span>
      
      {/* Particle effects */}
      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-caution/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-0 group-hover:scale-100 group-hover:animate-float"></span>
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-0 group-hover:scale-100 group-hover:animate-float" style={{animationDelay: "200ms"}}></span>
    </PrimaryButton>
  );

  return to ? (
    <Link to={to}>{ButtonContent}</Link>
  ) : (
    ButtonContent
  );
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [hoverItem, setHoverItem] = useState(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  // the mobile menu has its own language list
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslations("header");
  const locale = useLocale();
  const intlRouter = useRouter();
  const intlPathname = usePathname();

  // Navigation items with their routes or section IDs
  const navigationItems = [
    { label: t("nav.home"), path: "/", section: "home", icon: faHome },
    { label: t("nav.about"), path: "/about", section: "about", icon: faInfoCircle },
    { label: t("nav.raceCategories"), path: "/race-categories", section: "race-categories", icon: faRunning },
    { label: t("nav.highlights"), path: "/#highlights", section: "highlights", icon: faHighlighter },
    { label: t("nav.events"), path: "/events", section: "events", icon: faRunning },
    { label: t("nav.schedule"), path: "/#schedule", section: "schedule", icon: faCalendar },
    { label: t("nav.register"), path: "/register", section: "register", icon: faUserPlus },
    { label: t("nav.sponsors"), path: "/sponsors", section: "sponsors", icon: faGift }
  ];

  // Language options
  const languageOptions = [
    { code: "en", name: "EN" },
    { code: "sw", name: "SW" }
  ];

  // Handle navigation
  const handleNavigation = (item) => {
    const { path, section } = item;
    
    if (path === '/' || path.startsWith('/#')) {
      // Always navigate with the section in state
      navigate('/', { state: { scrollTo: section } });
    } else {
      // Regular page navigation
      navigate(path);
    }
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  // Handle language switch
  const handleLanguageSwitch = (languageCode) => {
    // Stay on the same page (and query/hash) in the other language
    const suffix = window.location.search + window.location.hash;
    intlRouter.replace(intlPathname + suffix, { locale: languageCode, scroll: false });
    setLanguageDropdownOpen(false);
    setMobileLanguageOpen(false);
  };

  // Handle scroll after navigation
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      // Wait for the page to render
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView();
          // Clear the state to prevent unwanted scrolling
          navigate('/', { replace: true, state: {} });
        }
      }, 100);
    }
  }, [location, navigate]);

  // While the phone menu is open the page behind it must not scroll;
  // Escape closes the menu.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownOpen && !event.target.closest('.language-switcher')) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageDropdownOpen]);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we've scrolled enough to change header appearance
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Animation for logo letters
  const logoLetters = "MWAFEM".split("");

  return (
    <>
      {/* Utility Bar */}
      <div className="bg-tertiary/98 text-black/70 py-0.5 px-4 md:px-8 text-xs sticky top-0 z-[1000]">
        <div className="container mx-auto flex justify-between items-center">
          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-3">
            <a href="tel:+255755002886" className="flex items-center hover:text-primary/90 transition-colors">
              <FontAwesomeIcon icon={faPhone} className="mr-1 text-primary/80 text-[10px]" />
              <span>+255 755 002 886</span>
            </a>
            <a href="mailto:info@mwafem.com" className="flex items-center hover:text-primary/90 transition-colors">
              <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-primary/80 text-[10px]" />
              <span>info@mwafem.com</span>
            </a>
            <span className="flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-primary/80 text-[10px]" />
              <span>Plot No. 48, Block No. 21 Colonel Middleton Rd, Arusha <b>{t("officeNote")}</b></span>
            </span>
          </div>
          
          {/* Registration lookup (for people who have paid) */}
          <Link
            to="/registration-status"
            className="ml-auto mr-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[10px]" />
            <span>{t("checkRegistration")}</span>
          </Link>

          {/* Language Switcher */}
          <div className="language-switcher relative z-[1001]">
            <button 
              className="relative px-2 py-0.5 group cursor-pointer flex items-center text-black/70 hover:text-primary/90 transition-colors border border-primary/20 rounded-md hover:bg-tertiary/50"
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              aria-label={t("switchLanguage")}
            >
              <FontAwesomeIcon icon={faGlobe} className="mr-1 text-primary/80 text-[10px]" />
              <span className="font-medium mr-0.5 text-[11px]">{locale.toUpperCase()}</span>
              <span className="hidden md:inline text-[11px] text-black/70 mr-0.5">{t("languageWord")}</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`ml-0.5 text-[9px] transition-transform duration-300 ${languageDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Language Dropdown */}
            {languageDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-tertiary shadow-xl rounded-md overflow-hidden min-w-[160px] border border-primary/15 animate-fade-in-down z-[1002]">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSwitch(lang.code)}
                    className={`block w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors ${lang.code === locale ? 'bg-primary/5 text-primary font-medium' : 'text-black/70 hover:text-primary'}`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{lang.name}</span>
                      <span className="text-xs text-black/50 flex-1">{t(`languages.${lang.code}`)}</span>
                      {lang.code === locale && <span className="w-1.5 h-1.5 rounded-full bg-primary/50 ml-auto"></span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative top bar with enhanced gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/90 via-secondary/40 to-primary/50 overflow-hidden sticky top-[25px] z-[999]">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-10 h-1 bg-tertiary/20 animate-slide-right"></div>
          <div className="absolute top-0 left-2/3 w-6 h-1 bg-tertiary/10 animate-slide-right" style={{ animationDelay: "1s" }}></div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav 
        className={`py-1 px-2 md:px-8 flex justify-between items-center w-full z-[998] transition-all duration-500 backdrop-blur-md fixed ${
          scrolled ? "bg-tertiary/95 shadow-sm py-1" : "bg-tertiary/90"
        } ${showHeader || mobileMenuOpen ? "top-[26px]" : "-top-24"}`}
      >
        {/* Logo area with active-link-style design */}
        <div 
          className="relative flex items-center group cursor-pointer" 
          onClick={() => navigate('/')}
        >
          {/* Enhanced decorative circles with pulse and glow effects */}
          <div className="absolute -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute -top-2 -left-3 w-4 h-4 rounded-full bg-primary/30 animate-pulse"></div>
            <div className="absolute -bottom-1 left-2 w-3 h-3 rounded-full bg-secondary/40 animate-pulse" style={{animationDelay: "300ms"}}></div>
            <div className="absolute top-1 -right-2 w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{animationDelay: "600ms"}}></div>
          </div>
          
          {/* Logo with active-link style effects */}
          <div className="relative px-2 py-1">
            {/* Enhanced background hover effect similar to active links */}
            <span className="absolute inset-0 w-full h-full transition-all duration-300 bg-gradient-to-r from-transparent via-secondary/20 to-transparent opacity-0 group-hover:opacity-100"></span>
            
            {/* Logo image */}
            <div className="relative bg-primary/90 rounded-lg">
              <Image
                src="/assets/logo/logo.png"
                alt={t("logoAlt")}
                width={136}
                height={96}
                priority
                className="h-12 w-auto object-contain"
              />
              
              {/* Text overlay that appears on hover - only for the animation effect */}
              <div aria-hidden="true" className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0">
                <div className="flex overflow-hidden py-1">
                  {logoLetters.map((letter, index) => (
                    <div 
                      key={index} 
                      className="relative overflow-hidden"
                      onMouseEnter={() => setHoverItem(`logo-${index}`)}
                      onMouseLeave={() => setHoverItem(null)}
                    >
                      <span className="text-2xl font-bold text-transparent">{letter}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Tagline with enhanced reveal animation */}
          <span aria-hidden="true" className="ml-2 text-[10px] text-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-500 tracking-wider overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-slide-in-right" style={{animationDelay: "150ms"}}>FESTIVAL</span>
            <span className="inline-block mx-1 animate-slide-in-right" style={{animationDelay: "250ms"}}>&</span>
            <span className="inline-block animate-slide-in-right" style={{animationDelay: "350ms"}}>MARATHON</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden show-desktop-1390 space-x-0.5 lg:space-x-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (location.pathname === '/' && activeSection === item.section);
            
            return (
              <button
                key={item.section}
                onClick={() => handleNavigation(item)}
                className="relative px-2 py-1.5 group cursor-pointer"
                onMouseEnter={() => setHoverItem(item.label)}
                onMouseLeave={() => setHoverItem(null)}
              >
                {/* Enhanced background hover effect */}
                <span 
                  className={`absolute inset-0 w-full h-full transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-transparent via-secondary/20 to-transparent opacity-100" 
                      : hoverItem === item.label 
                        ? "opacity-100 bg-gradient-to-r from-transparent via-primary/10 to-transparent" 
                        : "opacity-0"
                  }`}
                ></span>
                
                {/* Text with enhanced transition */}
                <span 
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? "text-primary/90" 
                      : "text-black/85 hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Enhanced animated underline */}
                <span 
                  className={`absolute bottom-1 left-0 w-full h-0.5 transform origin-left transition-all duration-300 
                    ${isActive ? "scale-x-100 bg-gradient-to-r from-primary/20 to-secondary/50" : "scale-x-0 bg-primary/20"} 
                    ${hoverItem === item.label ? "scale-x-100" : ""}`}
                ></span>

                {/* Decorative dot with pulse effect */}
                {isActive && (
                  <span className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-secondary/50 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Enhanced CTA Button */}
        <div className="hidden show-desktop-1390-block">
          <GradientButton 
            to="/register"
            className="shadow-sm hover:shadow-md"
            compact={true}
          >
            {t("joinNow")}
          </GradientButton>
        </div>

        {/* Enhanced Mobile Menu Button */}
        <div className="hide-mobile-1390 flex items-center">
          {/* Mobile Menu Toggle Button */}
          <button
            className="relative w-11 h-11 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("toggleMenu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="text-xl" />
          </button>
        </div>
      </nav>

      {/* Backdrop behind the phone menu: tap to close */}
      <div
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 top-[90px] z-30 bg-primary/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Enhanced Mobile Menu Dropdown */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-[90px] z-40 max-h-[calc(100dvh-90px)] overflow-y-auto overscroll-contain bg-tertiary rounded-b-2xl shadow-xl border-b border-primary/10 transition-all duration-300 transform ${
          mobileMenuOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="py-3 px-4 space-y-0.5">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (location.pathname === '/' && activeSection === item.section);
            
            return (
              <button
                key={item.section}
                onClick={() => {
                  handleNavigation(item);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`relative block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-tertiary"
                    : "text-primary hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center">
                  {isActive && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-secondary"></span>}
                  <span className={`mr-3 w-5 text-center ${isActive ? "text-secondary" : "text-primary/80"}`}>
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  {item.label}
                </div>
              </button>
            );
          })}
          
          {/* Mobile Language Switcher */}
          <div className="language-switcher pt-2 pb-1">
            <button
              onClick={() => setMobileLanguageOpen(!mobileLanguageOpen)}
              aria-expanded={mobileLanguageOpen}
              className="flex items-center w-full py-3 px-4 text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors border border-primary/20 cursor-pointer"
            >
              <FontAwesomeIcon icon={faGlobe} className="mr-3 w-5 text-primary/80" />
              <span>{t("currentLanguage")}</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`ml-auto text-xs transition-transform duration-300 ${mobileLanguageOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {/* Mobile Language Options */}
            {mobileLanguageOpen && (
              <div className="ml-4 mr-4 mt-1 space-y-1 bg-tertiary rounded-md overflow-hidden shadow-md border border-primary/15">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSwitch(lang.code)}
                    className={`block w-full text-left py-3 px-4 ${lang.code === locale ? 'text-primary/90 font-medium' : 'text-black/70'} hover:bg-primary/10 transition-colors`}
                  >
                    {t(`languages.${lang.code}`)}
                    {lang.code === locale && <span className="ml-2 w-1.5 h-1.5 inline-block rounded-full bg-primary/50"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Enhanced Mobile CTA Button */}
          <div className="pt-2 pb-1">
            <GradientButton 
              to="/register"
              className="w-full"
              gradientFrom="from-secondary"
              gradientTo="to-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("joinNow")}
            </GradientButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;