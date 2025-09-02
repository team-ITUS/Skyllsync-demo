'use client';

import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'API Documentation', href: '#api' },
  ],
  Resources: [
    { label: 'Help Center', href: '#help' },
    { label: 'Training Materials', href: '#training' },
    { label: 'Case Studies', href: '#cases' },
    { label: 'Webinars', href: '#webinars' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Careers', href: '#careers' },
    { label: 'Press Kit', href: '#press' },
    { label: 'Contact', href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Security', href: '#security' },
    { label: 'Compliance', href: '#compliance' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Github, href: '#github', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-neutral-900 text-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="text-2xl font-bold text-brand-gold mb-4">Skyllsync</div>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Empowering organizations to deliver world-class training and certification programs 
                with precision, accountability, and scale.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-neutral-400">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <span>contact@indianrescue.com</span>
                </div>
                <div className="flex items-center space-x-3 text-neutral-400">
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <span>+91 9561599991</span>
                </div>
                <div className="flex items-center space-x-3 text-neutral-400">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <span>Pune, MH</span>
                </div>
              </div>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-neutral-400 hover:text-brand-gold transition-colors duration-200 text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-neutral-400">
              <span>&copy; 2024 Skyllsync. All rights reserved.</span>
              <span>•</span>
              <span>Version 2.4.1</span>
              <span>•</span>
              <a href="#status" className="flex items-center space-x-1 hover:text-brand-gold transition-colors duration-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Status</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => { const Icon = social.icon; return (
                <a key={social.label} href={social.href} className="text-neutral-400 hover:text-brand-gold transition-colors duration-200" aria-label={social.label}>
                  <Icon className="w-5 h-5" />
                </a>
              );})}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
