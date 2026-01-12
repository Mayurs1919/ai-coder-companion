import { AGENTS, Agent } from '@/types/agents';
import { AgentCard } from './AgentCard';
import { StatsBar } from './StatsBar';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all AI coding agents and their current status
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AGENTS.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>
    </div>
  );
}
