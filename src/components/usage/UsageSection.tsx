import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalOverview } from './GlobalOverview';
import { UsageTrends } from './UsageTrends';
import { AgentAnalytics } from './AgentAnalytics';
import { ArtifactTracking } from './ArtifactTracking';
import { CostAwareness } from './CostAwareness';
import { ProductivityIntelligence } from './ProductivityIntelligence';
import { PromptOptimization } from './PromptOptimization';
import { GovernanceControls } from './GovernanceControls';
import { BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function UsageSection() {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Usage Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Monitor AI agent performance, costs, and artifacts
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Tabs for Phase 1 & Phase 2 */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Overview Tab - Phase 1 */}
          <TabsContent value="overview" className="mt-0">
            <div className="space-y-6 pb-6">
              {/* Global Overview */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Overview
                </h2>
                <GlobalOverview />
              </section>

              {/* Usage Trends & Agent Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Trends
                  </h2>
                  <UsageTrends />
                </section>
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Agent Analytics
                  </h2>
                  <AgentAnalytics />
                </section>
              </div>

              {/* Artifact Tracking */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Artifacts & Outputs
                </h2>
                <ArtifactTracking />
              </section>

              {/* Cost Awareness */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Cost Intelligence
                </h2>
                <CostAwareness />
              </section>
            </div>
          </TabsContent>

          {/* Intelligence Tab - Phase 2 */}
          <TabsContent value="intelligence" className="mt-0">
            <div className="space-y-6 pb-6">
              {/* Productivity Intelligence */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Productivity Intelligence
                </h2>
                <ProductivityIntelligence />
              </section>

              {/* Prompt Optimization */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Prompt Optimization
                </h2>
                <PromptOptimization />
              </section>
            </div>
          </TabsContent>

          {/* Governance Tab - Phase 2 */}
          <TabsContent value="governance" className="mt-0">
            <div className="space-y-6 pb-6">
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Usage Limits & Controls
                </h2>
                <GovernanceControls />
              </section>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
