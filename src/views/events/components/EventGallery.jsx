"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import SectionHeader from '../../../components/common/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faFilter,
  faGripHorizontal,
  faXmark,
  faInfoCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const EventGallery = () => {
  const t = useTranslations("events.gallery");
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [layout, setLayout] = useState('grid'); // 'grid' or 'masonry'
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const carouselRef = useRef(null);
  // Measured after mount so the page can be pre-rendered on the server
  const [viewportWidth, setViewportWidth] = useState(1024);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  const galleryRef = useRef(null);
  const dragX = useMotionValue(0);
  
  // Enhanced gallery with all available images
  const galleryImages = [
    {
      src: '/assets/images/runners_1.jpg',
      alt: t("marathonRunnersCompeting"),
      category: 'Marathon',
      featured: true
    },
    {
      src: '/assets/images/award.jpg',
      alt: t("awardCeremony"),
      category: t("celebration"),
      featured: false
    },
    {
      src: '/assets/images/runners_2.jpg',
      alt: t("runnersCrossingFinishLine"),
      category: 'Marathon',
      featured: true
    },
    {
      src: '/assets/images/yas_and_runner_while_running.jpg',
      alt: t("yasAndRunnerWhile"),
      category: 'Marathon',
      featured: true
    },
    {
      src: '/assets/images/runners_3.jpg',
      alt: t("runnersPreparingForThe"),
      category: 'Marathon',
      featured: false
    },
    {
      src: '/assets/images/runners_4.jpg',
      alt: t("runnersCompetingOnThe"),
      category: 'Marathon',
      featured: true
    },
    {
      src: '/assets/images/yas_sponsor_picture_1.jpg',
      alt: t("yasSponsorPartnership"),
      category: t("sponsors"),
      featured: false
    },
    {
      src: '/assets/images/finish_arch.jpg',
      alt: t("finishLineArch"),
      category: t("infrastructure"),
      featured: false
    },
    {
      src: '/assets/images/yas_sponsor_picture_2.jpg',
      alt: t("yasSponsorSupport"),
      category: t("sponsors"),
      featured: false
    },
    {
      src: '/assets/images/giving_awards.jpg',
      alt: t("presentingAwardsToWinners"),
      category: t("celebration"),
      featured: true
    },
    {
      src: '/assets/images/participant_celebration.jpg',
      alt: t("participantCelebration"),
      category: t("celebration"),
      featured: true
    },
    {
      src: '/assets/images/handshake.jpg',
      alt: t("handshakeAfterVictory"),
      category: t("celebration"),
      featured: false
    },
    {
      src: '/assets/images/yas_sponsor_picture_3.jpg',
      alt: t("yasSponsorTogether"),
      category: t("sponsors"),
      featured: false
    },
    {
      src: '/assets/images/team.jpg',
      alt: t("eventOrganizingTeam"),
      category: t("team"),
      featured: false
    },
    {
      src: '/assets/images/yas_sponsor_picture_4.jpg',
      alt: t("yasSponsorUnity"),
      category: t("sponsors"),
      featured: false
    },
    {
      src: '/assets/images/team_2.jpg',
      alt: t("eventOrganizersTogether"),
      category: t("team"),
      featured: true
    },
    {
      src: '/assets/images/participant_celebration_2.jpg',
      alt: t("participantCelebration2"),
      category: t("celebration"),
      featured: false
    },
    {
      src: '/assets/images/sponsors.jpg',
      alt: t("eventSponsors"),
      category: t("sponsors"),
      featured: false
    },
    {
      src: '/assets/images/yas_sponsor_picture_5.jpg',
      alt: t("yasSponsorSpirit"),
      category: t("sponsors"),
      featured: false
    },
    {
      src: '/assets/images/dancing_participants.jpg',
      alt: t("dancingParticipants"),
      category: t("celebration"),
      featured: true
    }
  ];

  // Get unique categories for filter
  const categories = ['all', ...new Set(galleryImages.map(img => img.category))];

  // Filter images based on selected category
  const filteredImages = filterCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filterCategory);

  // Featured images for top carousel
  const featuredImages = galleryImages.filter(img => img.featured);

  // Handle image navigation in enlarged view
  const navigateImage = (direction) => {
    if (selectedImage === null) return;
    
    const currentIndex = filteredImages.findIndex(img => img.src === selectedImage.src);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    
    setSelectedImage(filteredImages[newIndex]);
    
    // Scroll to top of enlarged view
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage === null) return;
      
      if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, filteredImages]);

  // Scroll to top when selecting an image
  useEffect(() => {
    if (selectedImage && galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedImage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const carouselItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const enlargedImageVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 30,
      transition: {
        duration: 0.3
      }
    }
  };

  const filterMenuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.3,
        when: "afterChildren"
      }
    },
    open: { 
      opacity: 1,
      height: 'auto',
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const filterButtonVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 }
  };

  // Function to determine grid layout for masonry effect
  const getMasonryColumnSpan = (index, isFeatured) => {
    if (layout === 'grid') {
      return isFeatured ? 'sm:col-span-2 row-span-1' : 'col-span-1 row-span-1';
    } else {
      // More complex masonry layout
      if (isFeatured) {
        return 'sm:col-span-2 sm:row-span-2';
      } else {
        // Distribute non-featured images in a more interesting pattern
        const pattern = index % 5;
        if (pattern === 0) return 'col-span-1 row-span-1';
        if (pattern === 1) return 'col-span-1 row-span-2';
        if (pattern === 2) return 'sm:col-span-2 row-span-1';
        return 'col-span-1 row-span-1';
      }
    }
  };

  // Calculate aspect ratio for grid vs masonry
  const getAspectRatio = (index, isFeatured) => {
    if (layout === 'grid') {
      return isFeatured ? 'pb-[56.25%]' : 'pb-[75%]';
    } else {
      // Varied aspect ratios for masonry
      const pattern = index % 5;
      if (pattern === 0) return 'pb-[100%]';
      if (pattern === 1) return 'pb-[125%]';
      if (pattern === 2) return 'pb-[75%]';
      if (pattern === 3) return 'pb-[85%]';
      return 'pb-[90%]';
    }
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4" ref={galleryRef}>
      <SectionHeader firstWord={t("titleFirst")} secondWord={t("titleSecond")} />
      
      {/* Enlarged Image View - Shows when an image is selected */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="mb-12 mt-6"
            variants={enlargedImageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-tertiary/5 rounded-2xl p-4 shadow-lg">
              {/* Navigation header */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-tertiary/10 hover:bg-tertiary/20 rounded-lg text-text-primary transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>{t("backToGallery")}</span>
                </button>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigateImage('prev')}
                    className="p-2 bg-tertiary/10 hover:bg-tertiary/20 rounded-lg text-text-primary transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <span className="text-sm font-medium">
                    {filteredImages.findIndex(img => img.src === selectedImage.src) + 1} / {filteredImages.length}
                  </span>
                  <button 
                    onClick={() => navigateImage('next')}
                    className="p-2 bg-tertiary/10 hover:bg-tertiary/20 rounded-lg text-text-primary transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
                
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-2 bg-tertiary/10 hover:bg-tertiary/20 rounded-lg text-text-primary transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              
              {/* Enlarged image */}
              <div className="relative rounded-xl overflow-hidden bg-tertiary/5">
                <div className="flex justify-center">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    width={1600}
                    height={1067}
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="max-h-[70vh] w-auto h-auto max-w-full object-contain"
                  />
                </div>
                
                {/* Image details */}
                <div className="bg-gradient-to-t from-black/70 to-transparent p-6 absolute bottom-0 left-0 right-0">
                  <span className="inline-block px-3 py-1 bg-primary rounded-full text-xs font-medium mb-2 text-tertiary">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-xl font-semibold text-tertiary">{selectedImage.alt}</h3>
                </div>
              </div>
              
              {/* Thumbnails for quick navigation */}
              <div className="mt-4 py-2">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {filteredImages.map((img, idx) => (
                    <div 
                      key={`thumb-${idx}`}
                      className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                        img.src === selectedImage.src ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={640}
                        height={427}
                        sizes="320px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Featured Carousel */}
      <div className="mt-8 mb-12 overflow-hidden">
        <h3 className="text-lg font-medium mb-4 inline-flex items-center">
          <span className="w-8 h-1 bg-primary mr-2 rounded-full"></span>
          {t("featuredPhotos")}
        </h3>
        
        <div className="relative">
          <motion.div 
            className="flex gap-4 py-4 pl-4"
            ref={carouselRef}
            drag="x"
            dragConstraints={{ left: -(featuredImages.length * 320 - viewportWidth + 32), right: 0 }}
            style={{ x: dragX }}
          >
            {featuredImages.map((image, index) => (
              <motion.div
                key={`featured-${index}`}
                className="flex-shrink-0 w-80 h-48 relative rounded-xl overflow-hidden shadow-lg"
                variants={carouselItemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-75"></div>
                <div className="absolute bottom-0 left-0 p-4 text-tertiary">
                  <span className="inline-block px-3 py-1 bg-primary rounded-full text-xs font-bold text-tertiary shadow-lg">
                    {image.category}
                  </span>
                  <h3 className="text-lg font-semibold line-clamp-2">{image.alt}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Carousel navigation indicators */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
            {featuredImages.map((_, index) => (
              <button 
                key={`indicator-${index}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === 0 ? 'bg-primary w-6' : 'bg-tertiary/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Gallery Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="relative">
          <button
            className="px-4 py-2 bg-tertiary/10 hover:bg-tertiary/20 rounded-lg flex items-center gap-2 text-text-primary font-medium transition-all duration-300"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          >
            <FontAwesomeIcon icon={faFilter} className="text-primary" />
            <span>{filterCategory === 'all' ? t("all") : filterCategory}</span>
          </button>
          
          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div
                className="absolute left-0 top-full mt-2 bg-tertiary/95 backdrop-blur-sm rounded-lg shadow-xl z-10 overflow-hidden"
                variants={filterMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="p-2">
                  {categories.map((category, index) => (
                    <motion.button
                      key={index}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 w-full text-left mb-1 last:mb-0 ${
                        filterCategory === category 
                          ? 'bg-primary text-tertiary' 
                          : 'hover:bg-tertiary/50 text-text-primary'
                      }`}
                      onClick={() => {
                        setFilterCategory(category);
                        setIsFilterMenuOpen(false);
                      }}
                      variants={filterButtonVariants}
                    >
                      {category === 'all' ? t("all") : category}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg transition-all duration-300 ${
              layout === 'grid' ? 'bg-primary text-tertiary' : 'bg-tertiary/10 text-text-primary hover:bg-tertiary/20'
            }`}
            onClick={() => setLayout('grid')}
            aria-label={t("gridLayout")}
          >
            <FontAwesomeIcon icon={faGripHorizontal} />
          </button>
          <button
            className={`p-2 rounded-lg transition-all duration-300 ${
              layout === 'masonry' ? 'bg-primary text-tertiary' : 'bg-tertiary/10 text-text-primary hover:bg-tertiary/20'
            }`}
            onClick={() => setLayout('masonry')}
            aria-label={t("masonryLayout")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="3" rx="1" />
              <rect x="9" y="6" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="3" rx="1" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Image count */}
      <div className="mb-4 text-sm text-text-primary/70">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        {filteredImages.length} {filteredImages.length === 1 ? t("photo") : t("photos")} {filterCategory !== 'all' ? t('inCategory', { category: filterCategory }) : ''}
      </div>
      
      {/* Gallery Grid */}
      <motion.div 
        className={`grid gap-4 auto-rows-auto ${
          layout === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "100px" }}
      >
        {filteredImages.map((image, index) => {
          const spanClasses = getMasonryColumnSpan(index, image.featured);
          const aspectRatio = getAspectRatio(index, image.featured);
          
          return (
            <motion.div
              key={index}
              className={`${spanClasses} group`}
              variants={itemVariants}
            >
              <div 
                className="h-full rounded-xl overflow-hidden shadow-lg cursor-pointer relative" 
                onClick={() => setSelectedImage(image)}
              >
                <div className={`w-full overflow-hidden ${aspectRatio}`}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={800}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Image overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category badge */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-block px-3 py-1 bg-primary rounded-full text-xs font-bold text-tertiary shadow-lg">
                      {image.category}
                    </span>
                  </div>
                  
                  {/* Image details */}
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-tertiary font-semibold text-lg">{image.alt}</h3>
                    
                    {/* View button */}
                    <div className="mt-3 flex items-center space-x-2">
                      <button className="px-4 py-1 bg-primary text-tertiary rounded-full text-sm font-medium transform hover:scale-105 transition-transform duration-300">
                        {t("viewDetails")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* No results message */}
      {filteredImages.length === 0 && (
        <div className="text-center py-16 bg-tertiary/5 rounded-xl">
          <h3 className="text-xl font-medium text-text-primary/70">{t("noPhotosInThis")}</h3>
          <p className="mt-2 text-text-primary/50">{t("pleaseSelectAnotherCategory")}</p>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
