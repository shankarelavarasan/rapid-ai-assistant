import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
const Carousel3D = ({ items, autoRotate = false, rotationSpeed = 3000, className = '' }) => {
    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRotating, setIsRotating] = useState(autoRotate);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentRotation, setCurrentRotation] = useState(0);
    const intervalRef = useRef(null);
    const itemCount = items.length;
    const angleStep = 360 / itemCount;
    const radius = 200; // Distance from center
    // Auto rotation effect
    useEffect(() => {
        if (isRotating && !isDragging) {
            intervalRef.current = setInterval(() => {
                rotateToNext();
            }, rotationSpeed);
        }
        else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRotating, isDragging, rotationSpeed]);
    // Update carousel rotation
    useEffect(() => {
        if (carouselRef.current) {
            const rotation = -currentIndex * angleStep;
            setCurrentRotation(rotation);
            carouselRef.current.style.transform = `rotateY(${rotation}deg)`;
        }
    }, [currentIndex, angleStep]);
    const rotateToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % itemCount);
    };
    const rotateToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
    };
    const rotateToIndex = (index) => {
        setCurrentIndex(index);
    };
    const toggleAutoRotate = () => {
        setIsRotating(!isRotating);
    };
    // Mouse drag handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setIsRotating(false);
    };
    const handleMouseMove = (e) => {
        if (!isDragging)
            return;
        const deltaX = e.clientX - startX;
        const sensitivity = 0.5;
        const rotationDelta = deltaX * sensitivity;
        if (carouselRef.current) {
            carouselRef.current.style.transform = `rotateY(${currentRotation + rotationDelta}deg)`;
        }
    };
    const handleMouseUp = (e) => {
        if (!isDragging)
            return;
        const deltaX = e.clientX - startX;
        const threshold = 50;
        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                rotateToPrev();
            }
            else {
                rotateToNext();
            }
        }
        setIsDragging(false);
    };
    // Touch handlers for mobile
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setIsRotating(false);
    };
    const handleTouchMove = (e) => {
        if (!isDragging)
            return;
        const deltaX = e.touches[0].clientX - startX;
        const sensitivity = 0.5;
        const rotationDelta = deltaX * sensitivity;
        if (carouselRef.current) {
            carouselRef.current.style.transform = `rotateY(${currentRotation + rotationDelta}deg)`;
        }
    };
    const handleTouchEnd = (e) => {
        if (!isDragging)
            return;
        const deltaX = e.changedTouches[0].clientX - startX;
        const threshold = 50;
        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                rotateToPrev();
            }
            else {
                rotateToNext();
            }
        }
        setIsDragging(false);
    };
    if (!items.length) {
        return (<div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No items to display</p>
      </div>);
    }
    return (<div className={`relative w-full h-96 overflow-hidden ${className}`}>
      {/* 3D Scene Container */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
        {/* Carousel Container */}
        <div ref={carouselRef} className="relative w-64 h-64 transition-transform duration-700 ease-out cursor-grab active:cursor-grabbing" style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${currentRotation}deg)`
        }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {items.map((item, index) => {
            const rotateY = index * angleStep;
            const translateZ = radius;
            const isActive = index === currentIndex;
            return (<div key={item.id} className={`absolute w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ${isActive ? 'scale-110 z-10' : 'scale-100'}`} style={{
                    transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                    transformStyle: 'preserve-3d'
                }} onClick={() => rotateToIndex(index)}>
                {/* Card Content */}
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
                  {/* Background Image */}
                  <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300" loading="lazy"/>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    {item.description && (<p className="text-sm opacity-90 line-clamp-3">
                        {item.description}
                      </p>)}
                  </div>
                  
                  {/* Active Indicator */}
                  {isActive && (<div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"/>)}
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-yellow-500/0 group-hover:from-purple-500/20 group-hover:via-pink-500/20 group-hover:to-yellow-500/20 transition-all duration-500 rounded-xl"/>
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2">
        <button onClick={rotateToPrev} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group" aria-label="Previous item">
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform"/>
        </button>
      </div>

      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <button onClick={rotateToNext} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group" aria-label="Next item">
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform"/>
        </button>
      </div>

      {/* Auto Rotate Toggle */}
      <div className="absolute top-4 right-4">
        <button onClick={toggleAutoRotate} className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${isRotating
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-white/20 text-white hover:bg-white/30'} backdrop-blur-md`} aria-label={isRotating ? 'Stop auto rotation' : 'Start auto rotation'}>
          <RotateCcw className={`w-5 h-5 transition-transform duration-300 ${isRotating ? 'animate-spin' : ''}`}/>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (<button key={index} onClick={() => rotateToIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                ? 'bg-yellow-400 scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/70 hover:scale-110'}`} aria-label={`Go to item ${index + 1}`}/>))}
      </div>

      {/* Item Counter */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {itemCount}
      </div>
    </div>);
};
export default Carousel3D;
//# sourceMappingURL=Carousel3D.js.map