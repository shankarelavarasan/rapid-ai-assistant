import React from 'react';
interface ImageSliderProps {
    images: string[];
    autoPlay?: boolean;
    interval?: number;
    showControls?: boolean;
    className?: string;
}
declare const ImageSlider: React.FC<ImageSliderProps>;
export default ImageSlider;
