'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

const benefits = [
  'Setup in under 24 hours',
  'White-glove onboarding included',
  '30-day free trial',
  'No long-term commitments'
];

export function CallToAction() {
  const [isVisible, setIsVisible] = useState(false);
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
    <section ref={sectionRef} className="py-20 bg-brand-navy relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-brand-gold/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-brand-gold/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
            Launch Your Training Engine{' '}
            <span className="text-brand-gold">Today</span>
          </h2>
          
          <p className={`text-xl text-neutral-300 max-w-3xl mx-auto mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Join industry leaders who trust Skyllsync to deliver world-class training and certification programs. 
            Start building excellence into your organization's skill development process.
          </p>

          {/* Benefits List */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className={`flex items-center justify-center md:justify-start space-x-2 text-white ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <CheckCircle className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <span className="text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <Button 
              size="lg"
              className="bg-brand-gold hover:bg-brand-gold-dark text-brand-navy hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 group px-8 py-4 text-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            
          </div>

          {/* Trust Indicator */}
          <div className={`mt-12 text-center ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
            <p className="text-neutral-400 text-sm mb-4">
              Trusted by 500+ organizations worldwide
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-xs text-neutral-500 px-4 py-2 border border-neutral-600 rounded-full">
                ISO 27001 Certified
              </div>
              <div className="text-xs text-neutral-500 px-4 py-2 border border-neutral-600 rounded-full">
                SOC 2 Type II
              </div>
              <div className="text-xs text-neutral-500 px-4 py-2 border border-neutral-600 rounded-full">
                GDPR Compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
