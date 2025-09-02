'use client';

import { useEffect, useRef, useState } from 'react';

const features = [
  'Multi-Tenant Control',
  'Automated Limits',
  'Certificate Engine',
  'Usage Tracking',
  'Compliance Dashboard',
  'Real-time Monitoring',
  'API Integration',
  'Custom Branding',
  'Bulk Operations',
  'Advanced Analytics',
  'Mobile Access',
  'Cloud Infrastructure',
];

export function FeaturesStrip() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-16 bg-brand-navy overflow-hidden">
      <div className="mb-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Comprehensive Feature Set
          </h2>
          <p className="text-neutral-300">
            Everything you need for modern training and certification management
          </p>
        </div>
      </div>

      {/* Features Marquee */}
      <div 
        className={`relative ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`flex space-x-6 ${isPaused ? '' : 'animate-marquee'}`}>
          {/* First set */}
          {features.map((feature, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white whitespace-nowrap hover:bg-brand-gold hover:text-brand-navy transition-all duration-300"
            >
              {feature}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {features.map((feature, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white whitespace-nowrap hover:bg-brand-gold hover:text-brand-navy transition-all duration-300"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </section>
  );
}
