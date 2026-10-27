"use client";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from '@/lib/router';
import HighlightSection from "./components/HighlightSection";
import ScheduleSection from "./components/ScheduleSection";
import RegistrationCTA from "../about/components/RegistrationCTA";
import HeroSection from "./components/HeroSection";
import EventTypes from "./components/EventType";
import AboutSection from "./components/AboutSection";
import SponsorSection from "../about/components/SponsorSection";
import MarathonBanner from "./components/Banner";
import { getActiveBanner } from "../../api/marathon/banner";

const MwafemLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerStatus, setBannerStatus] = useState({
    status: 'loading',
    data: null
  });

  // Fetch active marathon banner
  useEffect(() => {
    let isMounted = true;
    
    const fetchBannerStatus = async () => {
      try {
        const response = await getActiveBanner();
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Handle the API response structure
        if (response.status === 'active' && response.data) {
          setBannerStatus({
            status: 'active',
            data: response.data
          });
        } else if (response.status === 'closed') {
          setBannerStatus({
            status: 'closed',
            message: response.message || 'No active marathon registration available'
          });
        } else {
          // Default to closed if response format is unexpected
          console.warn('Unexpected banner status response:', response);
          setBannerStatus({
            status: 'closed',
            message: 'No active marathon registration available'
          });
        }
      } catch (error) {
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        console.error('Error fetching banner status:', error);
        setBannerStatus({ 
          status: 'closed', 
          message: 'No active marathon registration available' 
        });
      }
    };

    fetchBannerStatus();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle section scrolling after page load
  useEffect(() => {
    if (location.state?.scrollTo) {
      // Wait for the page to be fully rendered
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          // Use scrollIntoView with a smooth behavior
          element.scrollIntoView();
          // Clear the state
          navigate('/', { replace: true, state: {} });
        }
      }, 500); // Increased timeout to ensure page is fully loaded

      return () => clearTimeout(scrollTimer);
    }
  }, [location.state, navigate]);

  return (
    <>

      <div className="bg-gradient-to-b from-blue-50 to-transparent">
        {/* Show banner if active or loading, otherwise show hero section */}
        {(bannerStatus.status === 'active' || bannerStatus.status === 'loading') ? (
          <MarathonBanner bannerData={bannerStatus.data || {}} isLoading={bannerStatus.status === 'loading'} />
        ) : (
          <HeroSection />
        )}

        {/* About Section */}
        <AboutSection />

        {/* Highlight Section */}
        <HighlightSection />

        {/* Event Types */}
        <EventTypes />

        {/* Schedule Section */}
        <ScheduleSection />

        {/* Registration CTA Section */}
        <RegistrationCTA />

        {/* Sponsors Section */}
        <SponsorSection />
      </div>
    </>
  );
};

export default MwafemLanding;
