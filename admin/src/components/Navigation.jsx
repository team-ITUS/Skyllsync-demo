'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../BaseURL';

// Ensure corresponding section root elements have matching id attributes
// home -> <section id="home" ...>
// why-choose -> ValuePillars
// about -> AboutSection
// how-it-works -> HowItWorks
// contact -> Footer
const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#why-choose', label: 'Why Choose Us' },
  { href: '#about', label: 'About Us' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#contact', label: 'Contact Us' },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const scrollLockRef = useRef(false); // prevent flash when programmatic scroll
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Observe sections to highlight active nav link
  useEffect(() => {
    const ids = navLinks.map(l => l.href.slice(1));
    const elements = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!elements.length) return; // no sections yet
    const observer = new IntersectionObserver(
      entries => {
        if (scrollLockRef.current) return; // ignore while programmatic scrolling
        // Pick the entry closest to top that's intersecting
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-40% 0px -55% 0px', // focus middle band
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, href) => {
    if (!href.startsWith('#')) return; // normal link
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      scrollLockRef.current = true;
  // Manual smooth scroll with offset so content isn't hidden behind fixed nav
  const navEl = document.querySelector('nav');
  const navHeight = navEl ? navEl.offsetHeight : 0;
  const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 8; // extra gap
  window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
      // Update hash without adding history entry
      if (history.replaceState) {
        history.replaceState(null, '', href);
      } else {
        window.location.hash = href;
      }
      setActiveId(id);
      // release the lock after animation (~600ms)
      setTimeout(() => { scrollLockRef.current = false; }, 700);
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-md' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex-shrink-0">
            <img
              src={`${BASE_URL}/uploads/images/logo-1730780329049.png`}
              alt="Skyllsync"
              className="h-10 w-auto"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => {
              const current = activeId === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative transition-colors duration-200 group ${current ? 'text-brand-navy font-semibold' : 'text-neutral-700 hover:text-brand-navy'}`}
                  style={{ animationDelay: `${index * 50}ms`, textDecoration: 'none' }}
                  aria-current={current ? 'section' : undefined}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300 ${current ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300"
              onMouseOver={() => setIsHovered(true)}
              onMouseOut={() => setIsHovered(false)}
              style={{
                color: isHovered ? 'white' : '#374174',
              }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              className="bg-brand-gold hover:bg-brand-gold-dark text-brand-navy hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Register
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-brand-navy hover:text-brand-gold transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMenuOpen 
          ? 'max-h-screen bg-white/95 backdrop-blur-sm shadow-lg' 
          : 'max-h-0'
      }`}>
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link, index) => {
            const current = activeId === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block transition-colors duration-200 py-2 animate-fade-up ${current ? 'text-brand-navy font-semibold' : 'text-neutral-700 hover:text-brand-navy'}`}
                style={{ animationDelay: `${index * 80}ms` }}
                aria-current={current ? 'section' : undefined}
              >
                {link.label}
              </a>
            );
          })}
          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              variant="outline" 
              className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300"
            >
              Login
            </Button>
            <Button 
              className="bg-brand-gold hover:bg-brand-gold-dark text-brand-navy hover:text-white transition-all duration-300"
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
