import React, { useState } from 'react';
import ImageSlider from '../components/ImageSlider';
import Carousel3D from '../components/Carousel3D';
import CursorEffects, { useCursorEffects, cursorPresets } from '../components/CursorEffects';
import GlassNavbar, { GlassCard, GlassButton } from '../components/GlassNavbar';
import SmoothScroll, { ScrollReveal, ParallaxElement, SmoothScrollNav } from '../components/SmoothScroll';
import { Palette, Sparkles, Zap, Eye, Navigation, Scroll } from 'lucide-react';

const ModernUIDemo: React.FC = () => {
  const { enabled, config, toggleEffects, updateConfig } = useCursorEffects();
  const [selectedPreset, setSelectedPreset] = useState('rainbow');

  // Sample data for components
  const sliderImages = [
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20cityscape%20with%20neon%20lights%20and%20flying%20cars%20cyberpunk%20style&image_size=landscape_16_9',
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20digital%20art%20with%20flowing%20particles%20and%20vibrant%20colors&image_size=landscape_16_9',
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20glass%20architecture%20with%20holographic%20displays&image_size=landscape_16_9',
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=space%20station%20interior%20with%20advanced%20technology%20and%20blue%20lighting&image_size=landscape_16_9'
  ];

  const carouselItems = [
    {
      id: '1',
      title: 'AI Analytics',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=data%20visualization%20dashboard%20with%20charts%20and%20graphs%20modern%20ui&image_size=square_hd',
      description: 'Advanced analytics powered by artificial intelligence'
    },
    {
      id: '2',
      title: 'Document Processing',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=document%20scanning%20and%20processing%20technology%20futuristic&image_size=square_hd',
      description: 'Intelligent document recognition and processing'
    },
    {
      id: '3',
      title: 'Cloud Integration',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cloud%20computing%20network%20with%20connected%20devices%20blue%20theme&image_size=square_hd',
      description: 'Seamless cloud storage and synchronization'
    },
    {
      id: '4',
      title: 'Real-time Collaboration',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=team%20collaboration%20workspace%20with%20multiple%20screens%20modern&image_size=square_hd',
      description: 'Work together in real-time from anywhere'
    },
    {
      id: '5',
      title: 'Security & Privacy',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20shield%20with%20encryption%20symbols%20dark%20theme&image_size=square_hd',
      description: 'Enterprise-grade security and data protection'
    }
  ];

  const navSections = [
    { id: 'hero', label: 'Hero' },
    { id: 'slider', label: 'Image Slider' },
    { id: 'carousel', label: '3D Carousel' },
    { id: 'cursor', label: 'Cursor Effects' },
    { id: 'glass', label: 'Glass UI' },
    { id: 'scroll', label: 'Scroll Effects' }
  ];

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = cursorPresets[presetName as keyof typeof cursorPresets];
    if (preset) {
      updateConfig(preset);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Cursor Effects */}
      <CursorEffects enabled={enabled} {...config} />
      
      {/* Glass Navbar */}
      <GlassNavbar logoText="Modern UI Demo" />
      
      {/* Smooth Scroll Navigation */}
      <SmoothScrollNav sections={navSections} />
      
      {/* Main Content */}
      <SmoothScroll>
        <div className="pt-20">
          {/* Hero Section */}
          <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <ParallaxElement speed={0.3} className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-yellow-600/20" />
            </ParallaxElement>
            
            <ScrollReveal direction="fade" duration={1}>
              <div className="text-center text-white z-10 relative max-w-4xl mx-auto px-6">
                <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  Modern UI
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/80">
                  Experience the future of user interfaces with stunning animations and effects
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <GlassButton size="lg" onClick={() => document.getElementById('slider')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explore Components
                  </GlassButton>
                  <GlassButton variant="secondary" size="lg" onClick={toggleEffects}>
                    <Eye className="w-5 h-5 mr-2" />
                    {enabled ? 'Disable' : 'Enable'} Cursor Effects
                  </GlassButton>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Image Slider Section */}
          <section id="slider" className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    GSAP Image Slider
                  </h2>
                  <p className="text-xl text-white/80">
                    Smooth 3D transitions powered by GSAP animations
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.4}>
                <GlassCard className="p-8">
                  <ImageSlider 
                    images={sliderImages}
                    autoPlay={true}
                    interval={5000}
                    className="w-full"
                  />
                </GlassCard>
              </ScrollReveal>
            </div>
          </section>

          {/* 3D Carousel Section */}
          <section id="carousel" className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    3D Carousel
                  </h2>
                  <p className="text-xl text-white/80">
                    Interactive 3D carousel with touch and drag support
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.4}>
                <GlassCard className="p-8">
                  <Carousel3D 
                    items={carouselItems}
                    autoRotate={true}
                    rotationSpeed={4000}
                  />
                </GlassCard>
              </ScrollReveal>
            </div>
          </section>

          {/* Cursor Effects Section */}
          <section id="cursor" className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="max-w-4xl mx-auto w-full">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    Cursor Effects
                  </h2>
                  <p className="text-xl text-white/80 mb-8">
                    Interactive cursor trails with colorful particles
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.4}>
                <GlassCard className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.keys(cursorPresets).map((presetName) => (
                      <GlassButton
                        key={presetName}
                        variant={selectedPreset === presetName ? 'primary' : 'secondary'}
                        onClick={() => handlePresetChange(presetName)}
                        className="capitalize"
                      >
                        {presetName}
                      </GlassButton>
                    ))}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <GlassButton onClick={toggleEffects}>
                      <Zap className="w-4 h-4 mr-2" />
                      {enabled ? 'Disable' : 'Enable'} Effects
                    </GlassButton>
                  </div>
                  
                  <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white/80 text-center">
                      Move your cursor around to see the magical particle effects!
                    </p>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </section>

          {/* Glass UI Section */}
          <section id="glass" className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    Glass Morphism
                  </h2>
                  <p className="text-xl text-white/80">
                    Beautiful glass-like UI components with backdrop blur
                  </p>
                </div>
              </ScrollReveal>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ScrollReveal direction="left" delay={0.3}>
                  <GlassCard className="p-6">
                    <Palette className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Design System</h3>
                    <p className="text-white/70">Consistent glass morphism design language</p>
                  </GlassCard>
                </ScrollReveal>
                
                <ScrollReveal direction="up" delay={0.4}>
                  <GlassCard className="p-6">
                    <Navigation className="w-8 h-8 text-pink-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Navigation</h3>
                    <p className="text-white/70">Intuitive navigation with glass effects</p>
                  </GlassCard>
                </ScrollReveal>
                
                <ScrollReveal direction="right" delay={0.5}>
                  <GlassCard className="p-6">
                    <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Animations</h3>
                    <p className="text-white/70">Smooth transitions and micro-interactions</p>
                  </GlassCard>
                </ScrollReveal>
              </div>
              
              <ScrollReveal direction="up" delay={0.6}>
                <div className="mt-12 text-center">
                  <GlassButton size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started
                  </GlassButton>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Scroll Effects Section */}
          <section id="scroll" className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="max-w-4xl mx-auto w-full">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    Scroll Effects
                  </h2>
                  <p className="text-xl text-white/80">
                    Smooth scrolling with parallax and reveal animations
                  </p>
                </div>
              </ScrollReveal>
              
              <div className="space-y-8">
                <ScrollReveal direction="left" delay={0.3}>
                  <GlassCard className="p-6">
                    <div className="flex items-center space-x-4">
                      <Scroll className="w-8 h-8 text-blue-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Smooth Scrolling</h3>
                        <p className="text-white/70">Buttery smooth scroll experience with momentum</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
                
                <ScrollReveal direction="right" delay={0.4}>
                  <GlassCard className="p-6">
                    <div className="flex items-center space-x-4">
                      <Eye className="w-8 h-8 text-green-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Scroll Reveal</h3>
                        <p className="text-white/70">Elements animate into view as you scroll</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
                
                <ScrollReveal direction="up" delay={0.5}>
                  <GlassCard className="p-6">
                    <div className="flex items-center space-x-4">
                      <Zap className="w-8 h-8 text-purple-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Parallax Effects</h3>
                        <p className="text-white/70">Background elements move at different speeds</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-20 px-6">
            <ScrollReveal direction="fade" delay={0.2}>
              <div className="max-w-4xl mx-auto text-center">
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ready to build amazing UIs?
                  </h3>
                  <p className="text-white/70 mb-6">
                    All components are built with React, TypeScript, and Tailwind CSS
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <GlassButton size="lg">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Building
                    </GlassButton>
                    <GlassButton variant="secondary" size="lg">
                      View Documentation
                    </GlassButton>
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </footer>
        </div>
      </SmoothScroll>
    </div>
  );
};

export default ModernUIDemo;