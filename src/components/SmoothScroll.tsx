import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

interface SmoothScrollProps {
  children: React.ReactNode;
  speed?: number;
  showScrollToTop?: boolean;
  className?: string;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({
  children,
  speed = 0.8,
  showScrollToTop = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const animationRef = useRef<number>(0);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    
    if (!container || !content) return;

    // Set container height to content height
    const updateHeight = () => {
      const contentHeight = content.offsetHeight;
      document.body.style.height = `${contentHeight}px`;
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Smooth scroll animation
    const smoothScroll = () => {
      targetScrollY.current = window.scrollY;
      
      // Lerp (linear interpolation) for smooth scrolling
      currentScrollY.current += (targetScrollY.current - currentScrollY.current) * speed;
      
      // Apply transform
      content.style.transform = `translateY(${-currentScrollY.current}px)`;
      
      // Update scroll progress
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (currentScrollY.current / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      
      // Show/hide back to top button
      setShowBackToTop(currentScrollY.current > 300);
      
      animationRef.current = requestAnimationFrame(smoothScroll);
    };

    smoothScroll();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateHeight);
      document.body.style.height = 'auto';
    };
  }, [speed]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Smooth Scroll Container */}
      <div 
        ref={containerRef}
        className={`fixed inset-0 overflow-hidden ${className}`}
      >
        <div 
          ref={contentRef}
          className="will-change-transform"
        >
          {children}
        </div>
      </div>

      {/* Back to Top Button */}
      {showScrollToTop && showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-full shadow-lg hover:bg-white/30 hover:scale-110 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      )}
    </>
  );
};

// Hook for scroll-triggered animations
export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { scrollY, isScrolling };
};

// Scroll-triggered reveal animation component
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}> = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.6,
  threshold = 0.1,
  className = '' 
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay * 1000);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [delay, threshold]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    
    switch (direction) {
      case 'up':
        return 'translate3d(0, 50px, 0)';
      case 'down':
        return 'translate3d(0, -50px, 0)';
      case 'left':
        return 'translate3d(50px, 0, 0)';
      case 'right':
        return 'translate3d(-50px, 0, 0)';
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-out ${className}`}
      style={{
        transform: getTransform(),
        opacity: direction === 'fade' ? (isVisible ? 1 : 0) : (isVisible ? 1 : 0.8),
        transitionDuration: `${duration}s`,
        transitionProperty: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

// Parallax scroll effect component
export const ParallaxElement: React.FC<{
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}> = ({ children, speed = 0.5, direction = 'up', className = '' }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScrollAnimation();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate parallax offset
    const offset = (scrollY - elementTop + windowHeight) * speed;
    const transform = direction === 'up' ? -offset : offset;
    
    element.style.transform = `translate3d(0, ${transform}px, 0)`;
  }, [scrollY, speed, direction]);

  return (
    <div
      ref={elementRef}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

// Smooth scroll navigation component
export const SmoothScrollNav: React.FC<{
  sections: Array<{ id: string; label: string }>;
  className?: string;
}> = ({ sections, className = '' }) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className={`fixed left-8 top-1/2 -translate-y-1/2 z-40 ${className}`}>
      <div className="flex flex-col space-y-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/40 hover:bg-white/60 hover:scale-110'
            }`}
            aria-label={`Go to ${section.label}`}
          >
            {/* Tooltip */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {section.label}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SmoothScroll;