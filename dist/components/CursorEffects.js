import React, { useEffect, useRef, useState } from 'react';
const CursorEffects = ({ enabled = true, particleCount = 15, trailLength = 20, colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'], className = '' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(0);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    // Initialize canvas and particles
    useEffect(() => {
        if (!enabled)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Mouse move handler
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const newX = e.clientX - rect.left;
            const newY = e.clientY - rect.top;
            mouseRef.current = { x: newX, y: newY, isMoving: true };
            // Create new particles
            if (Math.random() < 0.8) {
                createParticles(newX, newY);
            }
            setIsVisible(true);
        };
        const handleMouseLeave = () => {
            mouseRef.current.isMoving = false;
            setIsVisible(false);
        };
        const handleMouseEnter = () => {
            setIsVisible(true);
        };
        // Add event listeners
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);
        // Create particles function
        const createParticles = (x, y) => {
            const velocity = Math.sqrt(Math.pow(x - lastMouseRef.current.x, 2) +
                Math.pow(y - lastMouseRef.current.y, 2)) * 0.1;
            for (let i = 0; i < Math.min(particleCount, 5); i++) {
                const particle = {
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * velocity * 0.5,
                    vy: (Math.random() - 0.5) * velocity * 0.5,
                    life: 0,
                    maxLife: 30 + Math.random() * 20,
                    size: 2 + Math.random() * 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1
                };
                particlesRef.current.push(particle);
            }
            // Limit total particles
            if (particlesRef.current.length > trailLength * 10) {
                particlesRef.current = particlesRef.current.slice(-trailLength * 8);
            }
            lastMouseRef.current = { x, y };
        };
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                // Update particle
                particle.life++;
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98; // Friction
                particle.vy *= 0.98;
                particle.alpha = 1 - (particle.life / particle.maxLife);
                // Draw particle
                if (particle.alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = particle.alpha;
                    // Create gradient for particle
                    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
                    gradient.addColorStop(0, particle.color);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    // Add glow effect
                    ctx.shadowColor = particle.color;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                return particle.life < particle.maxLife;
            });
            // Draw cursor glow
            if (isVisible && mouseRef.current.isMoving) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                const glowGradient = ctx.createRadialGradient(mouseRef.current.x, mouseRef.current.y, 0, mouseRef.current.x, mouseRef.current.y, 30);
                glowGradient.addColorStop(0, '#ffffff');
                glowGradient.addColorStop(0.5, colors[Math.floor(Date.now() / 200) % colors.length]);
                glowGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(mouseRef.current.x, mouseRef.current.y, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [enabled, particleCount, trailLength, colors]);
    if (!enabled) {
        return null;
    }
    return (<canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-50 ${className}`} style={{
            mixBlendMode: 'screen'
        }}/>);
};
// Hook for easy cursor effects management
export const useCursorEffects = () => {
    const [enabled, setEnabled] = useState(true);
    const [config, setConfig] = useState({
        particleCount: 15,
        trailLength: 20,
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
    });
    const toggleEffects = () => setEnabled(!enabled);
    const updateConfig = (newConfig) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };
    return {
        enabled,
        config,
        toggleEffects,
        updateConfig,
        setEnabled
    };
};
// Preset configurations
export const cursorPresets = {
    rainbow: {
        colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
        particleCount: 20,
        trailLength: 25
    },
    neon: {
        colors: ['#ff073a', '#39ff14', '#ff073a', '#00ffff', '#ff073a'],
        particleCount: 12,
        trailLength: 15
    },
    ocean: {
        colors: ['#0077be', '#00a8cc', '#0099cc', '#66ccff', '#99ddff'],
        particleCount: 18,
        trailLength: 22
    },
    fire: {
        colors: ['#ff4500', '#ff6347', '#ffa500', '#ffff00', '#ff1493'],
        particleCount: 25,
        trailLength: 30
    },
    minimal: {
        colors: ['#ffffff', '#f0f0f0', '#e0e0e0'],
        particleCount: 8,
        trailLength: 12
    }
};
export default CursorEffects;
//# sourceMappingURL=CursorEffects.js.map