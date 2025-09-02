import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ValuePillars } from './components/ValuePillars';
import { AboutSection } from './components/AboutSection';
import { FeaturesStrip } from './components/FeaturesStrip';
import { HowItWorks } from './components/HowItWorks';
import { TestimonialSection } from './components/TestimonialSection';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';

export default function LandingHome() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <ValuePillars />
        <AboutSection />
        <FeaturesStrip />
        <HowItWorks />
        <TestimonialSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
