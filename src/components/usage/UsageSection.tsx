import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalOverview } from './GlobalOverview';
import { UsageTrends } from './UsageTrends';
import { AgentAnalytics } from './AgentAnalytics';
import { ArtifactTracking } from './ArtifactTracking';
import { CostAwareness } from './CostAwareness';
import { BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

      {/* Content */}
      <ScrollArea className="flex-1">
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
      </ScrollArea>
    </div>
  );
}
