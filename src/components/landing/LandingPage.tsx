import { HeroSection } from './HeroSection';
import { WorkflowDiagram } from './WorkflowDiagram';
import { AIEngineSection } from './AIEngineSection';
import { AgentDashboardSection } from './AgentDashboardSection';
import { ArtifactExperienceSection } from './ArtifactExperienceSection';
import { DualPanelSection } from './DualPanelSection';
import { AnalyticsComparisonSection } from './AnalyticsComparisonSection';
import { SysEngineerShowcase } from './SysEngineerShowcase';
import { CaseStudiesSection } from './CaseStudiesSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* 1. Hero - Above the fold */}
      <HeroSection />
      
      {/* 2. IDE-Style Workflow Diagram */}
      <WorkflowDiagram />
      
      {/* 3. AI IDE Engine Concept */}
      <AIEngineSection />
      
      {/* 4. Agent Dashboard (Core Product Area) */}
      <AgentDashboardSection />
      
      {/* 5. Conversation → Artifact Experience */}
      <ArtifactExperienceSection />
      
      {/* 6. Dual Panel: Code vs UI */}
      <DualPanelSection />
      
      {/* 7. Usage & Analytics Section */}
      <AnalyticsComparisonSection />
      
      {/* 8. SysEngineer Workflow View */}
      <SysEngineerShowcase />
      
      {/* 9. Case Studies & Metrics */}
      <CaseStudiesSection />
      
      {/* 10. Final CTA */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
