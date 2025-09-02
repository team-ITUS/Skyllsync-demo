'use client';

import { useEffect, useRef, useState } from 'react';
import { Database, Shield, BarChart3, Zap } from 'lucide-react';

const pillars = [
  { icon: Database, title: 'Centralized Training', description: 'Unified platform for all training materials, assessments, and progress tracking across multiple departments and locations.' },
  { icon: Shield, title: 'Cert Automation', description: 'Automated certificate generation and validation with blockchain-backed verification for ultimate credibility.' },
  { icon: BarChart3, title: 'Real-Time Analytics', description: 'Comprehensive reporting and insights to track performance, compliance status, and skill development trends.' },
  { icon: Zap, title: 'Scalable Infrastructure', description: 'Multi-tenant architecture designed to grow with your organization, from small teams to enterprise-scale operations.' },
];

export function ValuePillars() {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        pillars.forEach((_, index) => {
          setTimeout(() => {
            setVisibleCards(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }, index * 150);
        });
      }
    }, { threshold: 0.2 });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
  <section id="why-choose" ref={sectionRef} className="py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">Why Choose Skyllsync?</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Built for organizations that demand excellence in training delivery, compliance management, and skill verification.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className={`group bg-white border border-neutral-200 rounded-2xl p-8 hover:shadow-2xl hover:border-brand-gold/50 transition-all duration-300 hover:-translate-y-2 ${visibleCards[index] ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 150}ms` }}>
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-gold/20 to-brand-navy/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-brand-navy group-hover:text-brand-gold transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-navy group-hover:text-brand-gold transition-colors duration-300">{pillar.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{pillar.description}</p>
                  <div className="w-0 h-0.5 bg-brand-gold transition-all duration-500 group-hover:w-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
