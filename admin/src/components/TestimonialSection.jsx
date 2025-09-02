'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from './ui/button';

const testimonials = [
  { content: "Automated license and certificate generation removed an error‑prone process and improved trust with auditors.", author: "Jonathan Patel", role: "Compliance Lead", company: "Aegis Safety Group", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80" }, 
  { content: "Onboarding instructors is now frictionless; templates and reusable modules saved us weeks this quarter.", author: "Laura Kim", role: "Program Enablement Manager", company: "Vertex Learning", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80" },
  { content: "Real-time analytics and progress tracking have revolutionized how we approach skill development. Our teams are more engaged and our compliance reporting is seamless.", author: "Dr. Emily Watson", role: "Chief Learning Officer", company: "MedResponse Training", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" }
];

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const nextTestimonial = () => setCurrentIndex(prev => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-neutral-900 via-brand-navy to-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl font-bold text-white mb-4 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>Trusted by Industry Leaders</h2>
          <p className={`text-xl text-neutral-300 max-w-3xl mx-auto ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>See how organizations worldwide are transforming their training programs</p>
        </div>
        <div className={`relative max-w-4xl mx-auto ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12 transition-all duration-500">
            <div className="flex items-start mb-8">
              <Quote className="w-12 h-12 text-brand-gold flex-shrink-0 mr-4" />
              <div className="flex-1">
                <p className="text-lg md:text-xl text-white leading-relaxed mb-8">"{testimonials[currentIndex].content}"</p>
                <div className="flex items-center">
                  <img src={testimonials[currentIndex].avatar} alt={testimonials[currentIndex].author} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-brand-gold/50" />
                  <div>
                    <div className="text-white font-semibold text-lg">{testimonials[currentIndex].author}</div>
                    <div className="text-neutral-300">{testimonials[currentIndex].role}</div>
                    <div className="text-brand-gold text-sm">{testimonials[currentIndex].company}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" size="icon" onClick={prevTestimonial} className="text-white hover:text-brand-gold hover:bg-white/10 transition-colors duration-300"><ChevronLeft className="w-6 h-6" /></Button>
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-brand-gold scale-110' : 'bg-white/30 hover:bg-white/50'}`} aria-label={`Go to testimonial ${index + 1}`} />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={nextTestimonial} className="text-white hover:text-brand-gold hover:bg-white/10 transition-colors duration-300"><ChevronRight className="w-6 h-6" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
