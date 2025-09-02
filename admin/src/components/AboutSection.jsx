'use client';

import { useEffect, useRef, useState } from 'react';
// import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

const stats = [
  { value: '1000+', label: 'Certificates Issued', color: 'bg-brand-gold' },
  { value: '24/7', label: 'Rapid Deployment', color: 'bg-brand-navy' },
  { value: '99.9%', label: 'Secure Multi-Tenant', color: 'bg-brand-gold' },
  { value: '10k+', label: 'Active Learners', color: 'bg-brand-navy' },
];

export function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
  <section ref={sectionRef} id="about" className="py-20 bg-gradient-to-br from-neutral-50 to-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`space-y-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">About Skyllsync</h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p className={`${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>Born from the rigorous standards of safety and rescue training, Skyllsync empowers institutions to deliver verified, skill-focused learning with uncompromising precision and accountability.</p>
                <p className={`${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>Our platform combines the discipline of rescue academy methodologies with cutting-edge technology, ensuring every certification represents genuine competency and readiness.</p>
                <p className={`${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>Whether training first responders, technical specialists, or safety professionals, we provide the infrastructure for excellence that scales without compromising on quality or security.</p>
              </div>
            </div>
            <div className={`space-y-4 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
              <h3 className="text-xl font-semibold text-brand-navy mb-6">Our Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: `${1 + index * 0.1}s` }}>
                    <Badge variant="secondary" className={`${stat.color} text-white hover:opacity-90 transition-opacity duration-300 px-4 py-2 w-full justify-center`}>
                      <div className="text-center">
                        <div className="font-bold text-lg">{stat.value}</div>
                        <div className="text-xs opacity-90">{stat.label}</div>
                      </div>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`relative ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* <ImageWithFallback src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Professional training and collaboration" className="w-full h-96 object-cover" /> */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h4 className="text-xl font-semibold mb-2">Excellence Through Rigor</h4>
                  <p className="text-sm opacity-90">Training programs built on the foundation of safety, precision, and real-world application.</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-gold">ISO</div>
                  <div className="text-xs text-neutral-600">27001 Certified</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-brand-gold rounded-xl shadow-lg p-4 text-white animate-float" style={{ animationDelay: '2s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold">A+</div>
                  <div className="text-xs opacity-90">Security Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
