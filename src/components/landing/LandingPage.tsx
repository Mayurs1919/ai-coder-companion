import { HeroSection } from './HeroSection';
import { AgentsSection } from './AgentsSection';
import { IdeologySection } from './IdeologySection';
import { AudienceSection } from './AudienceSection';
import { FeaturesSection } from './FeaturesSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <AgentsSection />
      <IdeologySection />
      <FeaturesSection />
      <AudienceSection />
      <CTASection />
      <Footer />
    </div>
  );
}
