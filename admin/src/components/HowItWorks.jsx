'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Rocket, Award } from 'lucide-react';

const steps = [
  { icon: Settings, title: 'Configure', description: 'Set up your training programs, define competency requirements, and customize certification criteria to match your organizational standards.', color: 'from-brand-gold to-yellow-500' },
  { icon: Rocket, title: 'Deploy', description: 'Launch your training modules with automated enrollment, progress tracking, and real-time performance monitoring across all departments.', color: 'from-brand-navy to-blue-600' },
  { icon: Award, title: 'Certify', description: 'Issue verified certificates with blockchain validation, automated compliance reporting, and seamless integration with your existing systems.', color: 'from-brand-gold to-orange-500' },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
  <section ref={sectionRef} className="py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">How It Works</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Three simple steps to transform your training and certification process</p>
        </div>

        {/* Desktop Version */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute top-24 left-0 w-full h-0.5 bg-neutral-200">
              <div className="h-full bg-brand-gold transition-all duration-1000 ease-out" style={{ width: isVisible ? `${((activeStep + 1) / steps.length) * 100}%` : '0%' }} />
            </div>
            <div className="grid grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon; const isActive = index <= activeStep;
                return (
                  <div key={step.title} className={`text-center cursor-pointer transition-all duration-500 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 200}ms` }} onClick={() => setActiveStep(index)}>
                    <div className={`relative mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isActive ? `bg-gradient-to-br ${step.color} text-white shadow-lg transform scale-110` : 'bg-neutral-100 text-neutral-400'}`}>
                      <Icon className="w-8 h-8" />
                      <div className={`absolute -inset-2 rounded-full border-2 transition-all duration-500 ${isActive ? 'border-brand-gold opacity-100' : 'border-transparent opacity-0'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isActive ? 'text-brand-navy' : 'text-neutral-500'}`}>{step.title}</h3>
                    <p className={`text-neutral-600 leading-relaxed transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Version */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className={`flex items-start space-x-4 p-6 rounded-2xl transition-all duration-500 ${index === activeStep ? 'bg-neutral-50 border-2 border-brand-gold/30' : 'bg-white border border-neutral-200'} ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 200}ms` }}>
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${index === activeStep ? `bg-gradient-to-br ${step.color} text-white` : 'bg-neutral-100 text-neutral-400'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${index === activeStep ? 'text-brand-navy' : 'text-neutral-700'}`}>Step {index + 1}: {step.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
