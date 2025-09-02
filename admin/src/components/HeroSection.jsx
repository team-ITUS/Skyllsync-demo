'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Award, BarChart3, Shield } from 'lucide-react';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
  <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 scroll-mt-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-navy/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-brand-gold/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-navy leading-tight">
                Powering Skill Growth &{' '}
                <span className="text-brand-gold">Certification Delivery</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-2xl">
                Train, track, and certify with precision. Our comprehensive platform automates compliance, 
                scales training operations, and delivers verified skill development for safety-critical industries.
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-navy hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                Start Training Today
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>

            <div className={`grid grid-cols-3 gap-8 pt-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-navy">1000+</div>
                <div className="text-sm text-neutral-600">Certificates Issued</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-navy">99.9%</div>
                <div className="text-sm text-neutral-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-navy">24/7</div>
                <div className="text-sm text-neutral-600">Support</div>
              </div>
            </div>
          </div>

          <div className={`relative ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-brand-navy">Training Dashboard</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-brand-gold" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900">Safety Protocols</div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-brand-gold h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-navy/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-brand-navy" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900">Performance Analytics</div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-brand-navy h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-brand-gold" />
                  <div>
                    <div className="text-xs font-semibold text-brand-navy">Certified</div>
                    <div className="text-xs text-neutral-600">Level 3</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e5e5" strokeWidth="4"/>
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      fill="none" 
                      stroke="#EBA135" 
                      strokeWidth="4"
                      strokeDasharray="175.93"
                      strokeDashoffset="35.19"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-navy">80%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
