"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { Link } from '@/lib/router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRunning, 
  faUsers, 
  faTrophy, 
  faHandshakeAngle,
  faChartLine,
  faHeart,
  faHospital,
  faArrowRight,
  faLeaf
} from "@fortawesome/free-solid-svg-icons";
import SectionHeader from "../../../components/common/SectionHeader";

const AboutSection = () => {
  const t = useTranslations("home.about");
  // Content data
  const stats = [
    {
      value: "2K+",
      label: t("participants"),
      icon: faRunning,
      description: t("runnersFromAllOver")
    },
    {
      value: "20+",
      label: t("partners"),
      icon: faHandshakeAngle,
      description: t("supportingOrganizationsAndSponsors")
    },
    {
      value: "50K+",
      label: t("prizePool"),
      icon: faTrophy,
      description: t("totalPrizeMoneyFor")
    },
    {
      value: "100+",
      label: t("volunteers"),
      icon: faUsers,
      description: t("dedicatedCommunityVolunteers")
    }
  ];

  const features = [
    {
      icon: faChartLine,
      title: t("empoweringGrowth"),
      description: t("supportingLocalTalentAnd")
    },
    {
      icon: faHeart,
      title: t("communityImpact"),
      description: t("creatingLastingPositiveChange")
    },
    {
      icon: faHospital,
      title: t("supportingHealth"),
      description: t("improvingTheHealthAnd")
    },
    {
      icon: faLeaf,
      title: t("promotingGreenEnvironment"),
      description: t("reducingOurEcologicalFootprint")
    },
  ];

  return (
    <section id="about" className="py-20 bg-tertiary relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <SectionHeader 
          firstWord={t("about")} 
          secondWord={t("us")} 
          className="mb-12"
        />
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-primary/75 leading-relaxed">
                {t("theMwangaFestivalMarathon")}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <FontAwesomeIcon 
                          icon={feature.icon} 
                          className="text-primary text-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-primary/75">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Stats */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="group relative">
                  <div className="relative z-10 bg-tertiary p-6 rounded-xl shadow-sm border border-primary/15 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-secondary/50 text-primary flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                          <FontAwesomeIcon icon={stat.icon} className="text-xl" aria-hidden="true" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-4xl font-extrabold mb-1 text-primary">
                          {stat.value}
                        </h3>
                        <p className="text-primary font-medium">{stat.label}</p>
                        <p className="text-sm text-primary/75 mt-1">{stat.description}</p>
                      </div>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20 bg-gradient-to-r from-primary to-secondary"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16">
          <Link to="/about" className="relative overflow-hidden group active:scale-98 cursor-pointer py-3">
            <span className="relative z-10 inline-flex items-center space-x-2 px-10 py-4 uppercase tracking-widest text-sm font-medium transition-colors hover:text-tertiary duration-300 group-hover:text-primary">
              <span>{t("ourFullStory")}</span>
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className="transform group-hover:translate-x-1 transition-transform duration-300"
              />
            </span>
            
            {/* Button decoration and effects */}
            <span className="absolute top-0 left-0 w-full h-full border border-transparent group-hover:border-transparent transition-colors duration-300"></span>
            <span className="absolute bottom-0 left-0 w-0 h-full bg-secondary group-hover:w-full transition-all duration-300 ease-out z-0"></span>
            
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></span>
            <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></span>
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;