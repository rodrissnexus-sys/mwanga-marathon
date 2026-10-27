"use client";

import { useTranslations } from "next-intl";
import React, { useState, useRef, useEffect } from "react";
import { Link } from '@/lib/router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faLocationDot,
  faCalendarDay,
  faChevronRight,
  faRunning,
  faAward,
  faMusic,
  faTree,
  faHospital,
  faUtensils
} from "@fortawesome/free-solid-svg-icons";
import { fetchSchedule } from "../../../api/eventData";
import PrimaryButton from "../../../components/common/buttons/PrimaryButton";

// Map string icon names to FontAwesome icons
const iconMap = {
  "faRunning": faRunning,
  "faAward": faAward,
  "faMusic": faMusic,
  "faTree": faTree,
  "faHospital": faHospital,
  "faUtensils": faUtensils,
  "faClock": faClock,
  "faLocationDot": faLocationDot,
  "faCalendarDay": faCalendarDay
};

// Skeleton loader for schedule section
const ScheduleSkeleton = () => {
  return (
    <>
      {/* Day selection skeleton */}
      <div className="flex justify-center mb-12">
        <div className="flex gap-1 p-1 bg-tertiary rounded-lg border border-primary/10 animate-pulse overflow-x-auto w-full max-w-[90vw] md:max-w-max">
          {[1, 2].map((item) => (
            <div key={item} className="px-8 py-3 rounded-md flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="h-6 bg-primary/20 rounded w-20 mb-1"></div>
                <div className="h-3 bg-primary/20 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Timeline skeleton */}
      <div className="relative">
        <div className="absolute left-[21px] top-0 bottom-0 w-px bg-primary/20"></div>
        
        {[1, 2, 3].map((item) => (
          <div key={item} className="relative pl-12 mb-8 animate-pulse">
            {/* Time Node */}
            <div className="absolute left-0 top-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"></div>
                <div className="absolute top-1/2 left-full w-3 h-px bg-primary/30"></div>
              </div>
              <div className="mt-2 w-10 h-3 bg-primary/20 rounded mx-auto"></div>
            </div>

            {/* Event Card */}
            <div className="relative mx-5">
              <div className="relative z-10 p-6 bg-white rounded-xl border-l-2 border-primary/20">
                {/* Content */}
                <div className="space-y-3">
                  <div className="h-5 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/20 rounded w-full"></div>
                  <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const ScheduleSection = () => {
  const t = useTranslations("home.schedule");
  const [activeDay, setActiveDay] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);
  
  // Fetch schedule data from API
  useEffect(() => {
    const getScheduleData = async () => {
      try {
        setLoading(true);
        const response = await fetchSchedule();
        
        if (response.success) {
          // Transform API data to match component structure
          const transformedData = response.data.map(day => ({
            day: day.day,
            date: day.date,
            events: day.events.map(event => ({
              time: event.time,
              title: event.title,
              location: event.location,
              description: event.description,
              icon: iconMap[event.icon] || faRunning // Fallback to faRunning if icon not found
            }))
          }));
          
          setScheduleData(transformedData);
        } else {
          setError(response.error || t("failedToFetchSchedule"));
          // Fallback to hardcoded data if API fails
          setScheduleData(fallbackScheduleData);
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError(t("anErrorOccurredWhile"));
        // Fallback to hardcoded data if API fails
        setScheduleData(fallbackScheduleData);
      } finally {
        setLoading(false);
      }
    };

    getScheduleData();
  }, []);

  // Fallback schedule data (original hardcoded data)
  const fallbackScheduleData = [
    {
      day: "N/A",
      date: "N/A",
      events: [
        {
          time: "N/A",
          title: "N/A",
          location: "N/A",
          description: "N/A",
          icon: faRunning
        },
        {
          time: "N/A",
          title: "N/A",
          location: "N/A",
          description: "N/A",
          icon: faMusic
        }
      ]
    },
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section 
      id="schedule" 
      ref={sectionRef} 
      className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/50 opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 rounded-full -ml-48 -mb-48"></div>

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header with decorative elements */}
        <div className="mb-16 relative">
          <div className="absolute left-0 top-1/2 w-16 h-px bg-primary/40"></div>
          <div className="absolute right-0 top-1/2 w-16 h-px bg-primary/40"></div>
          
          <h2 className="text-center text-4xl font-light tracking-widest uppercase">
            <span className="inline-block transform -skew-y-3 text-primary">{t("titleFirst")}</span>
            <span className="inline-block ml-3 relative text-text-primary">
              {t("titleSecond")}
              <span className="absolute -bottom-2 left-0 w-full h-px bg-secondary"></span>
            </span>
          </h2>
        </div>

        {loading ? (
          <ScheduleSkeleton />
        ) : error || !scheduleData || scheduleData.length === 0 || scheduleData[0]?.day === "N/A" ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-primary/10">
            <div className="max-w-md mx-auto px-6">
              <div className="mb-6">
                <FontAwesomeIcon icon={faCalendarDay} className="text-6xl text-primary/30 mb-4" />
                <h3 className="text-2xl font-semibold text-text-primary mb-3">
                  {t("scheduleInformationUnavailable")}
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
          <>
            {/* Day selection */}
            <div className="flex justify-center mb-12">
              <div className="flex gap-1 p-1 bg-tertiary rounded-lg border border-primary/10 overflow-x-auto w-full max-w-[90vw] md:max-w-max">
                {scheduleData.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDay(index)}
                    className={`
                      relative px-8 py-3 transition-all duration-300 
                      font-medium rounded-md group overflow-hidden flex-shrink-0
                      ${activeDay === index 
                        ? "text-primary" 
                        : "text-primary hover:text-primary"
                      }
                    `}
                  >
                    <span className={`
                      absolute inset-0 transition-all duration-300
                      ${activeDay === index 
                        ? 'bg-secondary opacity-100' 
                        : 'bg-primary/5 opacity-0 group-hover:opacity-100'
                      }
                    `}></span>
                    <span className="relative z-10 flex flex-col items-center">
                      <span className="text-lg">{day.day}</span>
                      <span className="text-xs opacity-75">{day.date}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Events Timeline */}
            <div className="relative">
              <div className="absolute left-[21px] top-0 bottom-0 w-px bg-primary/20"></div>
              
              {scheduleData[activeDay]?.events.map((event, index) => (
                <div 
                  key={index}
                  className={`
                    relative pl-12 mb-8 transition-all duration-700 transform
                    ${isLoaded ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
                  `}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Time Node */}
                  <div className="absolute left-0 top-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-white border-2 border-secondary flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-45">
                        <FontAwesomeIcon icon={event.icon || faClock} className="text-primary text-sm" />
                      </div>
                      <div className="absolute top-1/2 left-full w-3 h-px bg-primary/30"></div>
                    </div>
                    <div className="mt-2 text-xs font-medium text-primary/75 text-center">
                      {event.time}
                    </div>
                  </div>

                  {/* Event Card */}
                  <div className="relative group mx-5">
                    <div className={`
                      relative z-10 p-6 bg-white rounded-xl
                      transition-all duration-300 transform
                      border-l-2 border-primary/20
                      hover:border-l-4 hover:border-secondary
                      hover:translate-x-2
                    `}>
                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
                          {event.title}
                        </h3>
                        <p className="text-text-primary/70">{event.description}</p>
                        <div className="flex items-center text-sm text-primary/75">
                          <FontAwesomeIcon icon={faLocationDot} className="mr-2" />
                          {event.location}
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ScheduleSection;