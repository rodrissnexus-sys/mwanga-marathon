"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Trophy, Heart, Users, Smile, Star, Loader } from 'lucide-react';
import { Link } from '@/lib/router';

/**
 * Helper function to get all available event packages from banner data
 * Supports both new dynamic event_packages format and legacy hardcoded fields
 * @param {Object} bannerData - Banner data from API
 * @returns {Array} - Array of available packages with event data
 */
const getAvailablePackages = (bannerData) => {
  try {
    // Prefer new dynamic event_packages format if available
    if (bannerData.event_packages && Array.isArray(bannerData.event_packages)) {
      return bannerData.event_packages.filter(pkg => pkg.event); // Only include packages with event data
    }
    
    // Fallback to legacy format for backward compatibility
    const legacyPackages = [];
    
    if (bannerData.fun_run_event) {
      legacyPackages.push({
        category: 'fun_run',
        event_id: bannerData.fun_run_event.id,
        features: bannerData.fun_run_features || [],
        event: bannerData.fun_run_event
      });
    }
    
    if (bannerData.half_marathon_event) {
      legacyPackages.push({
        category: 'half_marathon',
        event_id: bannerData.half_marathon_event.id,
        features: bannerData.half_marathon_features || [],
        event: bannerData.half_marathon_event
      });
    }
    
    if (bannerData.full_marathon_event) {
      legacyPackages.push({
        category: 'full_marathon',
        event_id: bannerData.full_marathon_event.id,
        features: bannerData.full_marathon_features || [],
        event: bannerData.full_marathon_event
      });
    }
    
    return legacyPackages;
  } catch (error) {
    console.error('Error getting available packages:', error);
    return [];
  }
};

/**
 * Helper function to format category name from snake_case to Title Case
 * @param {string} category - Category identifier (e.g., 'fun_run', '10k_run')
 * @returns {string} - Formatted display name (e.g., 'Fun Run', '10k Run')
 */
const formatCategoryName = (category) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Helper function to get a specific package by category
 * @param {Object} bannerData - Banner data from API
 * @param {string} category - Category to find (e.g., 'fun_run', '10k_run')
 * @returns {Object|null} - Package object or null if not found
 */
const getPackageByCategory = (bannerData, category) => {
  try {
    if (bannerData.event_packages && Array.isArray(bannerData.event_packages)) {
      return bannerData.event_packages.find(pkg => pkg.category === category) || null;
    }
    
    // Fallback to legacy format
    switch (category) {
      case 'fun_run':
        return bannerData.fun_run_event ? {
          category: 'fun_run',
          event_id: bannerData.fun_run_event.id,
          features: bannerData.fun_run_features || [],
          event: bannerData.fun_run_event
        } : null;
      case 'half_marathon':
        return bannerData.half_marathon_event ? {
          category: 'half_marathon',
          event_id: bannerData.half_marathon_event.id,
          features: bannerData.half_marathon_features || [],
          event: bannerData.half_marathon_event
        } : null;
      case 'full_marathon':
        return bannerData.full_marathon_event ? {
          category: 'full_marathon',
          event_id: bannerData.full_marathon_event.id,
          features: bannerData.full_marathon_features || [],
          event: bannerData.full_marathon_event
        } : null;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error getting package by category:', error);
    return null;
  }
};

// Loading indicator component
function LoadingSpinner({ size = 'small' }) {
  const t = useTranslations("home.banner");
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${size === 'small' ? 'h-4 w-4' : 'h-6 w-6'} align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`} role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">{t('loading')}</span>
    </div>
  );
}

export default function MarathonBanner({ bannerData, isLoading = false }) {
  const t = useTranslations("home.banner");
  const locale = useLocale();
  const dateLocale = locale === 'sw' ? 'sw-TZ' : 'en-US';
  const [animateIn, setAnimateIn] = useState(false);
  const [activePackage, setActivePackage] = useState('half');
  const [hoverState, setHoverState] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [racingElements, setRacingElements] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    events: true,
    features: true,
    countdown: true
  });
  
  // Create racing elements for the background
  useEffect(() => {
    const elements = [];
    for (let i = 0; i < 10; i++) {
      elements.push({
        id: i,
        size: Math.random() * 30 + 10,
        speed: Math.random() * 15 + 5,
        startPosition: Math.random() * 100,
        delay: Math.random() * 5,
        color: i % 2 === 0 ? 'bg-secondary' : 'bg-primary'
      });
    }
    setRacingElements(elements);
  }, []);
  
  // Handle mouse movement for parallax effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePosition({
      x: (clientX / innerWidth) * 2 - 1,
      y: (clientY / innerHeight) * 2 - 1
    });
  };
  
  // Calculate countdown to event
  useEffect(() => {
    setAnimateIn(true);
    setLoadingStates(prev => ({ ...prev, countdown: true }));
    
    const calculateTimeLeft = () => {
      try {
        // Use the event_date from the API
        const eventDate = new Date(bannerData.event_date);
        const now = new Date();
        const difference = eventDate - now;
        
        // Check if registration is still open
        const regEndDate = new Date(bannerData.registration_end_date);
        setIsRegistrationOpen(now <= regEndDate);
        
        if (difference > 0) {
          setCountdown({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            mins: Math.floor((difference / 1000 / 60) % 60),
            secs: Math.floor((difference / 1000) % 60)
          });
        } else {
          // Event has passed
          setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        }
        
        setLoadingStates(prev => ({ ...prev, countdown: false }));
      } catch (error) {
        console.error('Error calculating time left:', error);
        // Set default values
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        setIsRegistrationOpen(false);
        setLoadingStates(prev => ({ ...prev, countdown: false }));
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [bannerData]);
  
  // Check if events are loaded and set active package to first available
  useEffect(() => {
    setLoadingStates(prev => ({ ...prev, events: true }));
    
    // Get all available packages using new dynamic format
    const availablePackages = getAvailablePackages(bannerData);
    
    // If packages are available, set active package to the first one
    if (availablePackages.length > 0) {
      setActivePackage(availablePackages[0].category);
    } else {
      // Fallback if no packages available
      setActivePackage('half');
    }
    
    // Delay to simulate loading
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, events: false, features: false }));
    }, 800);
  }, [bannerData]);
  
  // Handle mouse enter for package cards
  const handleMouseEnter = (packageName) => {
    setHoverState(prev => ({ ...prev, [packageName]: true }));
  };
  
  // Handle mouse leave for package cards
  const handleMouseLeave = (packageName) => {
    setHoverState(prev => ({ ...prev, [packageName]: false }));
  };
  
  // Get package features based on active package
  const getPackageFeatures = () => {
    try {
      // Map old category names to new ones for compatibility
      let categoryToFind = activePackage;
      if (activePackage === 'fun') categoryToFind = 'fun_run';
      if (activePackage === 'half') categoryToFind = 'half_marathon';
      if (activePackage === 'full') categoryToFind = 'full_marathon';
      
      const pkg = getPackageByCategory(bannerData, categoryToFind);
      return pkg ? pkg.features : [];
    } catch (error) {
      console.error('Error getting package features:', error);
      return [];
    }
  };
  
  // Get package name based on active package
  const getPackageName = () => {
    try {
      // Map old category names to new ones for compatibility
      let categoryToFind = activePackage;
      if (activePackage === 'fun') categoryToFind = 'fun_run';
      if (activePackage === 'half') categoryToFind = 'half_marathon';
      if (activePackage === 'full') categoryToFind = 'full_marathon';
      
      const pkg = getPackageByCategory(bannerData, categoryToFind);
      if (pkg && pkg.event) {
        return pkg.event.name || t('marathonEvent');
      }
      
      // Fallback to default names if event data is missing
      switch (activePackage) {
        case 'fun':
          return t('funRun');
        case 'half':
          return t('halfMarathon');
        case 'full':
          return t('fullMarathon');
        default:
          return t('marathonEvent');
      }
    } catch (error) {
      console.error('Error getting package name:', error);
      return t('marathonEvent');
    }
  };
  
  // Get package distance based on active package (extract from name or use category-based default)
  const getPackageDistance = () => {
    try {
      const extractDistance = (name) => {
        if (!name) return null;
        // Try to match distance in parentheses: (10km), (21km), etc.
        const match = name.match(/\((\d+[kK][mM])\)/);
        return match ? match[1].toUpperCase() : null;
      };
      
      // Map old category names to new ones for compatibility
      let categoryToFind = activePackage;
      if (activePackage === 'fun') categoryToFind = 'fun_run';
      if (activePackage === 'half') categoryToFind = 'half_marathon';
      if (activePackage === 'full') categoryToFind = 'full_marathon';
      
      const pkg = getPackageByCategory(bannerData, categoryToFind);
      let distance = null;
      
      // Try to extract from event name
      if (pkg && pkg.event) {
        distance = extractDistance(pkg.event.name);
      }
      
      // If no distance found in name, use category-based defaults
      if (!distance) {
        // Map category to default distance
        const categoryDefaults = {
          'fun_run': '5KM',
          'fun': '5KM',
          'half_marathon': '21KM',
          'half': '21KM',
          'full_marathon': '42KM',
          'full': '42KM',
          '10k_run': '10KM',
          '10k': '10KM',
          'kids_run': '3KM',
          'kids': '3KM',
          'cycling': 'CYCLING',
          'trail': 'TRAIL',
          'festival_pass': 'FESTIVAL'
        };
        
        // Try to find distance from category
        distance = categoryDefaults[categoryToFind] || categoryDefaults[activePackage];
      }
      
      return distance || 'N/A';
    } catch (error) {
      console.error('Error getting package distance:', error);
      return 'N/A';
    }
  };
  
  // Get package price based on active package
  const getPackagePrice = () => {
    try {
      // Map old category names to new ones for compatibility
      let categoryToFind = activePackage;
      if (activePackage === 'fun') categoryToFind = 'fun_run';
      if (activePackage === 'half') categoryToFind = 'half_marathon';
      if (activePackage === 'full') categoryToFind = 'full_marathon';
      
      const pkg = getPackageByCategory(bannerData, categoryToFind);
      if (pkg && pkg.event) {
        const price = pkg.event.foreign_price;
        // If price exists and doesn't already have a dollar sign, add it
        if (price && price !== 'N/A') {
          // Remove any existing dollar sign and convert to number
          const priceStr = String(price).replace(/[$,]/g, '');
          const priceNum = parseFloat(priceStr);
          
          // Format with thousand separators if it's a valid number
          if (!isNaN(priceNum)) {
            return `$${priceNum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
          }
          
          // If not a number, return as is with dollar sign
          return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
        }
        return 'N/A';
      }
      
      // Default prices if not found
      return 'N/A';
    } catch (error) {
      console.error('Error getting package price:', error);
      return 'N/A';
    }
  };
  
  // Get package description based on active package
  const getPackageDescription = () => {
    try {
      // Map old category names to new ones for compatibility
      let categoryToFind = activePackage;
      if (activePackage === 'fun') categoryToFind = 'fun_run';
      if (activePackage === 'half') categoryToFind = 'half_marathon';
      if (activePackage === 'full') categoryToFind = 'full_marathon';
      
      const pkg = getPackageByCategory(bannerData, categoryToFind);
      if (pkg && pkg.event) {
        return pkg.event.description || t('marathonEventLower');
      }
      
      // Default descriptions if not found
      return t('marathonEventLower');
    } catch (error) {
      console.error('Error getting package description:', error);
      return t('marathonEventLower');
    }
  };
  
  // Get package local price based on active package
  const getPackageLocalPrice = () => {
    try {
      // Map old category names to new ones for compatibility
      let categoryToFind = activePackage;
      if (activePackage === 'fun') categoryToFind = 'fun_run';
      if (activePackage === 'half') categoryToFind = 'half_marathon';
      if (activePackage === 'full') categoryToFind = 'full_marathon';
      
      const pkg = getPackageByCategory(bannerData, categoryToFind);
      if (pkg && pkg.event) {
        const localPrice = pkg.event.local_price;
        
        // Format local price with thousand separators
        if (localPrice && localPrice !== 'N/A') {
          // Remove any existing commas and convert to number
          const priceStr = String(localPrice).replace(/,/g, '');
          const priceNum = parseFloat(priceStr);
          
          // Format with thousand separators if it's a valid number
          if (!isNaN(priceNum)) {
            return priceNum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          }
          
          // If not a number, return as is
          return localPrice;
        }
        return 'N/A';
      }
      
      // Default prices if not found
      return 'N/A';
    } catch (error) {
      console.error('Error getting package local price:', error);
      return 'N/A';
    }
  };
  
  // Safe access to banner data with N/A fallbacks
  const title = bannerData?.title || 'N/A';
  const subtitle = bannerData?.subtitle || 'N/A';
  const location = bannerData?.location || 'N/A';
  const startTime = bannerData?.start_time || 'N/A';
  const maxParticipants = bannerData?.max_participants || 'N/A';
  
  // Check if events exist
  const hasFunRun = Boolean(bannerData?.fun_run_event);
  const hasHalfMarathon = Boolean(bannerData?.half_marathon_event);
  const hasFullMarathon = Boolean(bannerData?.full_marathon_event);
  
  
  // If we're in the initial loading state (no data yet), show a skeleton UI
  if (isLoading || !bannerData) {
    return (
      <div className="relative w-full bg-primary text-tertiary py-12 px-4 md:py-16 md:px-8 overflow-hidden mt-6">
        {/* Racing animation background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {racingElements.map(element => (
            <div 
              key={element.id}
              className={`absolute rounded-full ${element.color} blur-xl`}
              style={{
                width: `${element.size}px`,
                height: `${element.size}px`,
                top: `${element.startPosition}%`,
                animation: `raceAcross ${element.speed}s linear ${element.delay}s infinite`
              }}
            ></div>
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left column - Event info skeleton */}
            <div className="space-y-6 animate-pulse">
              <div>
                <div className="h-16 bg-tertiary/10 rounded-lg w-3/4 mb-2"></div>
                <div className="h-12 bg-tertiary/10 rounded-lg w-2/3 mb-6"></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-tertiary/10 mr-3"></div>
                  <div className="h-6 bg-tertiary/10 rounded w-1/2"></div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-tertiary/10 mr-3"></div>
                  <div className="h-6 bg-tertiary/10 rounded w-1/3"></div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-tertiary/10 mr-3"></div>
                  <div className="h-6 bg-tertiary/10 rounded w-2/5"></div>
                </div>
              </div>
              
              {/* Countdown timer skeleton */}
              <div className="pt-6">
                <div className="h-8 bg-tertiary/10 rounded w-1/3 mb-3"></div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="h-8 bg-tertiary/10 rounded mb-1"></div>
                    <div className="h-4 bg-tertiary/10 rounded w-1/2 mx-auto"></div>
                  </div>
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="h-8 bg-tertiary/10 rounded mb-1"></div>
                    <div className="h-4 bg-tertiary/10 rounded w-1/2 mx-auto"></div>
                  </div>
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="h-8 bg-tertiary/10 rounded mb-1"></div>
                    <div className="h-4 bg-tertiary/10 rounded w-1/2 mx-auto"></div>
                  </div>
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="h-8 bg-tertiary/10 rounded mb-1"></div>
                    <div className="h-4 bg-tertiary/10 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Registration packages skeleton */}
            <div>
              <div className="bg-tertiary/10 backdrop-blur-sm rounded-xl p-6">
                <div className="h-8 bg-tertiary/10 rounded w-1/2 mb-4"></div>
                
                {/* Package selection tabs skeleton */}
                <div className="flex mb-6 bg-tertiary/5 rounded-lg p-1">
                  <div className="flex-1 py-2 px-4 rounded-md bg-tertiary/5 mr-1"></div>
                  <div className="flex-1 py-2 px-4 rounded-md bg-tertiary/5 mr-1"></div>
                  <div className="flex-1 py-2 px-4 rounded-md bg-tertiary/5"></div>
                </div>
                
                {/* Active package details skeleton */}
                <div className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="h-6 bg-tertiary/10 rounded w-1/3"></div>
                    <div className="h-6 bg-tertiary/10 rounded w-1/6"></div>
                  </div>
                  
                  <div className="h-10 bg-tertiary/10 rounded w-1/4 mb-4"></div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="h-6 bg-tertiary/10 rounded"></div>
                    <div className="h-6 bg-tertiary/10 rounded"></div>
                    <div className="h-6 bg-tertiary/10 rounded"></div>
                  </div>
                  
                  <div className="h-12 bg-tertiary/10 rounded-lg"></div>
                </div>
                
                {/* Registration status skeleton */}
                <div className="flex justify-center">
                  <div className="h-4 bg-tertiary/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="relative w-full bg-primary text-tertiary py-12 px-4 md:py-16 md:px-8 overflow-hidden mt-6"
      onMouseMove={handleMouseMove}
    >
      {/* Racing animation background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {racingElements.map(element => (
          <div 
            key={element.id}
            className={`absolute rounded-full ${element.color} blur-xl`}
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              top: `${element.startPosition}%`,
              animation: `raceAcross ${element.speed}s linear ${element.delay}s infinite`
            }}
          ></div>
        ))}
      </div>
      
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateX(${mousePosition.x * 20}px) translateY(${mousePosition.y * 20}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-purple-500 blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left column - Event info */}
          <div className={`transition-all duration-1000 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="space-y-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-tertiary mt-6 mb-2">{title}</h1>
                <h2 className="text-4xl md:text-4xl font-bold text-secondary mb-6">{subtitle}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="mr-3 text-secondary" />
                  <span>
                    {bannerData?.event_date ? new Date(bannerData.event_date).toLocaleDateString(dateLocale, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="mr-3 text-secondary" />
                  <span>{location}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="mr-3 text-secondary" />
                  <span>{t('startingAt', { time: startTime })}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="mr-3 text-secondary" />
                  <span>{t('limitedTo', { count: maxParticipants })}</span>
                </div>
              </div>
              
              {/* Countdown timer */}
              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-3">
                  Event Countdown
                  {loadingStates.countdown && <LoadingSpinner size="small" className="ml-2" />}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-secondary">{countdown.days}</div>
                    <div className="text-xs uppercase">{t('days')}</div>
                  </div>
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-secondary">{countdown.hours}</div>
                    <div className="text-xs uppercase">{t('hours')}</div>
                  </div>
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-secondary">{countdown.mins}</div>
                    <div className="text-xs uppercase">{t('minutes')}</div>
                  </div>
                  <div className="bg-tertiary/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-secondary">{countdown.secs}</div>
                    <div className="text-xs uppercase">{t('seconds')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Registration packages */}
          <div className={`transition-all duration-1000 delay-300 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-tertiary/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">
                Registration Packages
                {loadingStates.events && <LoadingSpinner size="small" className="ml-2" />}
              </h3>
              
              {/* Package selection tabs - Dynamic rendering */}
              <div className="flex mb-6 bg-tertiary/5 rounded-lg p-1 overflow-x-auto">
                {loadingStates.events ? (
                  <div className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-center">
                    <LoadingSpinner size="small" />
                  </div>
                ) : (
                  <>
                    {getAvailablePackages(bannerData).map((pkg) => (
                      <button 
                        key={pkg.category}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition whitespace-nowrap ${activePackage === pkg.category ? 'bg-secondary text-primary' : 'hover:bg-tertiary/5'}`}
                        onClick={() => setActivePackage(pkg.category)}
                      >
                        {pkg.event?.name || formatCategoryName(pkg.category)}
                      </button>
                    ))}
                  </>
                )}
              </div>
              
              {/* Active package details */}
              <div className="mb-6">
                {loadingStates.events ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-sm text-tertiary/70">{t('loadingDetails')}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="text-xl font-bold">{getPackageName()}</h4>
                      <div className="text-sm bg-tertiary/20 px-2 py-1 rounded">{getPackageDistance()}</div>
                    </div>
                    
                    <div className="text-3xl font-bold text-secondary mb-4">
                      {getPackagePrice()}
                    </div>
                    
                    <div className="text-lg font-medium text-tertiary mb-4">{getPackageDescription()}</div>
                    
                    <div className="text-lg font-medium text-tertiary mb-4">{t('localPrice', { price: getPackageLocalPrice() })}</div>
                    
                    <ul className="space-y-2 mb-6">
                      {loadingStates.features ? (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner size="small" />
                        </div>
                      ) : (
                        <>
                          {getPackageFeatures().map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-secondary shrink-0 mr-2" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {getPackageFeatures().length === 0 && (
                            <li className="text-center text-primary/75 italic">{t('noPackageDetails')}</li>
                          )}
                        </>
                      )}
                    </ul>
                    
                    {isRegistrationOpen ? (
                      <Link 
                        to="/register" 
                        className={`block w-full py-3 px-6 text-center font-medium rounded-lg transition transform hover:scale-105 ${
                          hoverState[activePackage] ? 'bg-tertiary text-primary' : 'bg-secondary text-primary'
                        }`}
                        onMouseEnter={() => handleMouseEnter(activePackage)}
                        onMouseLeave={() => handleMouseLeave(activePackage)}
                      >
                        {t('registerNow')}
                      </Link>
                    ) : (
                      <div className="block w-full py-3 px-6 text-center font-medium rounded-lg bg-secondary/30 text-tertiary mt-6 cursor-not-allowed">
                        {t('registrationClosed')}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Registration status */}
              <div className="text-center text-sm">
                {isRegistrationOpen ? (
                  <div className="text-positive">
                    <span className="inline-block w-2 h-2 bg-positive/30 rounded-full mr-2"></span>
                    {t('openUntil', { date: bannerData?.registration_end_date ? new Date(bannerData.registration_end_date).toLocaleDateString(dateLocale === 'en-US' ? 'en-GB' : dateLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Dar_es_Salaam' }) : 'N/A' })}
                  </div>
                ) : (
                  <div className="text-negative">
                    <span className="inline-block w-2 h-2 bg-negative/30 rounded-full mr-2"></span>
                    {t('currentlyClosed')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}