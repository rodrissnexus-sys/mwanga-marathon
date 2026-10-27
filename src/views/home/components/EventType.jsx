"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from "react";
import { Link } from '@/lib/router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRunning, 
  faMusic, 
  faMasksTheater, 
  faTicket,
  faChevronRight,
  faCalendarCheck,
  faUserGroup,
  faGift,
  faStar,
  faTree,
  faHospital,
  faUtensils,
  faDrumstickBite
} from "@fortawesome/free-solid-svg-icons";
import SectionHeader from "../../../components/common/SectionHeader";
import { fetchEventTypes } from "../../../api/eventData";
import PrimaryButton from "../../../components/common/buttons/PrimaryButton";

// Map string icon names to FontAwesome icons
const iconMap = {
  "faRunning": faRunning,
  "faMusic": faMusic,
  "faMasksTheater": faMasksTheater,
  "faTicket": faTicket,
  "faChevronRight": faChevronRight,
  "faCalendarCheck": faCalendarCheck,
  "faUserGroup": faUserGroup,
  "faGift": faGift,
  "faStar": faStar,
  "faTree": faTree,
  "faHospital": faHospital,
  "faUtensils": faUtensils,
  "faDrumstickBite": faDrumstickBite
};

// Skeleton loader for event types
const EventTypeSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse">
          <div className="rounded-2xl bg-white shadow-md border border-primary/10 p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20"></div>
                  <div>
                    <div className="h-5 bg-primary/20 rounded w-40 mb-2"></div>
                    <div className="h-3 bg-primary/20 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-primary/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary/20 rounded w-3/4"></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EventTypes = () => {
  const t = useTranslations("home.eventTypes");
  const [activeType, setActiveType] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

  // Fetch event types from API
  useEffect(() => {
    const getEventTypes = async () => {
      try {
        setLoading(true);
        const response = await fetchEventTypes();
        
        if (response.success) {
          // Transform API data to match component structure
          const transformedData = response.data.map(eventType => ({
            id: eventType.event_id,
            title: eventType.title,
            subtitle: eventType.subtitle,
            icon: iconMap[eventType.icon] || faRunning, // Fallback to faRunning if icon not found
            color: eventType.color,
            description: eventType.description,
            highlight: eventType.highlight,
            image: eventType.image,
            features: eventType.features.map(feature => ({
              text: feature.text,
              icon: iconMap[feature.icon] || faRunning // Fallback to faRunning if icon not found
            }))
          }));
          
          setEventTypes(transformedData);
        } else {
          setError(response.error || t("failedToFetchEvent"));
          // Fallback to hardcoded data if API fails
          setEventTypes(fallbackEventTypes);
        }
      } catch (err) {
        console.error('Error fetching event types:', err);
        setError(t("anErrorOccurredWhile"));
        // Fallback to hardcoded data if API fails
        setEventTypes(fallbackEventTypes);
      } finally {
        setLoading(false);
      }
    };

    getEventTypes();
  }, []);

  // Fallback event types data (original hardcoded data)
  const fallbackEventTypes = [
    {
      id: "N/A",
      title: "N/A",
      subtitle: "N/A",
      icon: faRunning,
      color: "from-primary to-secondary",
      description: "N/A",
      features: [
        { text: "N/A", icon: faRunning },
        { text: "N/A", icon: faStar },
        { text: "N/A", icon: faMusic }
      ],
      highlight: "N/A",
      image: "/assets/images/runners_1.jpg"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      id="events" 
      ref={sectionRef} 
      className="py-24 bg-tertiary relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader 
          firstWord={t("titleFirst")} 
          secondWord={t("titleSecond")} 
          className="mb-16"
        />

        {loading ? (
          <EventTypeSkeleton />
        ) : error || !eventTypes || eventTypes.length === 0 || eventTypes[0]?.title === "N/A" ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-primary/10">
            <div className="max-w-md mx-auto px-6">
              <div className="mb-6">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-6xl text-primary/30 mb-4" />
                <h3 className="text-2xl font-semibold text-text-primary mb-3">
                  {t("eventProgramInformationUnavailable")}
                </h3>
                <p className="text-text-primary/70 mb-2">
                  {t("weReCurrentlyUpdating")}
                </p>
                <p className="text-text-primary/70 mb-6">
                  {t("visitOurRegistrationPage")}
                </p>
              </div>
              
              <Link to="/register">
                <PrimaryButton className="shadow-sm hover:shadow-md">
                  {t("learnHowToParticipate")}
                </PrimaryButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {eventTypes.map((event, index) => (
              <div
                key={event.id}
                className={`group relative transition-all duration-700 transform ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Card */}
                <div 
                  className={`
                    relative overflow-hidden rounded-2xl bg-white
                    transition-all duration-500 group-hover:shadow-xl
                    border border-primary/10
                    ${activeType === event.id ? 'shadow-lg' : 'shadow-md'}
                  `}
                  onClick={() => setActiveType(activeType === event.id ? null : event.id)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-black to-transparent opacity-10"></div>
                    <div className="grid grid-cols-3 h-full">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border-r border-b border-black/5"></div>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            bg-gradient-to-br ${event.color}
                            transform transition-transform duration-500
                            group-hover:scale-110 group-hover:rotate-6
                          `}>
                            <FontAwesomeIcon icon={event.icon} className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-500">{event.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed pr-6">{event.description}</p>
                      </div>
                      <button className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        transition-all duration-500 border border-primary/20
                        ${activeType === event.id ? 'bg-primary text-white rotate-90' : 'text-gray-400'}
                        group-hover:border-primary/20
                      `}>
                        <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                      </button>
                    </div>

                    {/* Features */}
                    <div className={`
                      grid grid-cols-3 gap-4 transition-all duration-500 overflow-hidden
                      ${activeType === event.id ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}
                    `}>
                      {event.features.map((feature, idx) => (
                        <div 
                          key={idx}
                          className="relative group/feature p-4 rounded-xl bg-gray-50 hover:bg-primary/10 transition-colors duration-300"
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <FontAwesomeIcon 
                              icon={feature.icon} 
                              className={`text-lg bg-gradient-to-r ${event.color} text-transparent bg-clip-text`}
                            />
                            <span className="text-sm text-gray-600 group-hover/feature:text-gray-900 transition-colors duration-300">
                              {feature.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Highlight Tag */}
                    <div className={`
                      absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-medium
                      transition-all duration-500 bg-gradient-to-r ${event.color}
                      text-white transform
                      ${activeType === event.id ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                    `}>
                      {event.highlight}
                    </div>
                  </div>

                  {/* Bottom Gradient Bar */}
                  <div className={`
                    absolute bottom-0 left-0 h-1 bg-gradient-to-r ${event.color}
                    transition-all duration-700 ease-out
                    ${activeType === event.id ? 'w-full' : 'w-0'}
                  `}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventTypes;