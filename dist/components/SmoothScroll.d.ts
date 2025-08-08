import React from 'react';
interface SmoothScrollProps {
    children: React.ReactNode;
    speed?: number;
    showScrollToTop?: boolean;
    className?: string;
}
declare const SmoothScroll: React.FC<SmoothScrollProps>;
export declare const useScrollAnimation: () => {
    scrollY: any;
    isScrolling: any;
};
export declare const ScrollReveal: React.FC<{
    children: React.ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}>;
export declare const ParallaxElement: React.FC<{
    children: React.ReactNode;
    speed?: number;
    direction?: 'up' | 'down';
    className?: string;
}>;
export declare const SmoothScrollNav: React.FC<{
    sections: Array<{
        id: string;
        label: string;
    }>;
    className?: string;
}>;
export default SmoothScroll;
