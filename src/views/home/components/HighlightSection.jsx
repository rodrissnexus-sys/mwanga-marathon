"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import SectionHeader from '@/components/common/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faRunning, faStore, faHeartbeat } from '@fortawesome/free-solid-svg-icons';

const HighlightSection = () => {
  const t = useTranslations("home.highlights");
    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef(null);

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

    const features = [
        {
            title: t("marathonEvent"),
            description:
                t("joinThousandsOfRunners"),
            icon: <FontAwesomeIcon icon={faRunning} className="text-4xl text-secondary" />,
        },
        {
            title: t("culturalPerformances"),
            description:
                t("experienceBreathtakingTraditionalDances"),
            icon: <FontAwesomeIcon icon={faMusic} className="text-4xl text-secondary" />,
        },
        {
            title: t("supportingHealthForMothers"),
            description:
                t("weSupportHealthEducation"),
            icon: <FontAwesomeIcon icon={faHeartbeat} className="text-4xl text-secondary" />,
        },
    ];

    return (
        <section 
            id="highlights" 
            ref={sectionRef} 
            className="py-24 bg-primary text-tertiary relative overflow-hidden"
        >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary opacity-5 rounded-full -ml-48 -mb-48"></div>
            
            <div className="max-w-6xl mx-auto px-6 relative">
                {/* Header with decorative elements */}
                <SectionHeader firstWord={t("festival")} secondWord={t("highlights")} tone="dark" className={`transition-all duration-1000 ${isInView ? "opacity-100" : "opacity-0"}`} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`relative group transition-all duration-700 transform ${
                                isInView 
                                    ? "translate-y-0 opacity-100" 
                                    : `translate-y-16 opacity-0`
                            }`}
                            style={{ 
                                transitionDelay: `${index * 200}ms`
                            }}
                        >
                            <div className="p-6 bg-tertiary/5 backdrop-blur-sm border-l-2 border-secondary transform transition-all duration-300 group-hover:translate-x-2 group-hover:bg-tertiary/10">
                                <div className="flex flex-col items-center text-center relative">
                                    {/* Corner accents */}
                                    <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    
                                    <h3 className="text-xl font-semibold text-tertiary mb-3 relative">
                                        {feature.title}
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-px bg-secondary transition-all duration-300 group-hover:w-full"></div>
                                    </h3>
                                    
                                    <p className="text-tertiary/90">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HighlightSection;