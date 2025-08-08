import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = true,
  interval = 4000,
  showControls = true,
  className = ''
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Initialize GSAP timeline
  useEffect(() => {
    if (!sliderRef.current) return;

    const slides = sliderRef.current.querySelectorAll('.slide');
    
    // Set initial positions
    gsap.set(slides, {
      opacity: 0,
      scale: 0.8,
      rotationY: 45,
      z: -100
    });

    // Show first slide
    if (slides[0]) {
      gsap.set(slides[0], {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        z: 0
      });
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [images]);

  // Auto play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, interval, images.length]);

  const animateSlide = (fromIndex: number, toIndex: number) => {
    if (!sliderRef.current) return;

    const slides = sliderRef.current.querySelectorAll('.slide');
    const currentSlide = slides[fromIndex];
    const nextSlide = slides[toIndex];

    if (!currentSlide || !nextSlide) return;

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline
    timelineRef.current = gsap.timeline();

    // Animate out current slide
    timelineRef.current.to(currentSlide, {
      opacity: 0,
      scale: 0.8,
      rotationY: -45,
      z: -100,
      duration: 0.6,
      ease: 'power2.inOut'
    });

    // Animate in next slide
    timelineRef.current.fromTo(nextSlide, 
      {
        opacity: 0,
        scale: 0.8,
        rotationY: 45,
        z: -100
      },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        z: 0,
        duration: 0.8,
        ease: 'power2.out'
      },
      '-=0.3'
    );
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % images.length;
    animateSlide(currentIndex, newIndex);
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    animateSlide(currentIndex, newIndex);
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      animateSlide(currentIndex, index);
      setCurrentIndex(index);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-96 overflow-hidden rounded-xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${className}`}>
      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="relative w-full h-full perspective-1000"
        style={{ perspective: '1000px' }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="slide absolute inset-0 w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover rounded-xl shadow-2xl"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl" />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/70 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isPlaying && images.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / images.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageSlider;