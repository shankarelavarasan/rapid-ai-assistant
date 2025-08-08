import React from 'react';
interface Carousel3DProps {
    items: Array<{
        id: string;
        title: string;
        image: string;
        description?: string;
    }>;
    autoRotate?: boolean;
    rotationSpeed?: number;
    className?: string;
}
declare const Carousel3D: React.FC<Carousel3DProps>;
export default Carousel3D;
