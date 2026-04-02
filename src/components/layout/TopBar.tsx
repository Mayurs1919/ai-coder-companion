import { Bell, Settings, Zap, Activity, Terminal, Eye, Rocket, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from './UserMenu';
import { useAgentStore } from '@/stores/agentStore';

export function TopBar() {
  const navigate = useNavigate();
  const agents = useAgentStore((state) => state.agents);
  const activeCount = agents.filter((a) => a.status === 'processing').length;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Left: System status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-console-success status-pulse" />
          <span className="text-xs text-muted-foreground font-mono">System Online</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Activity className="w-3.5 h-3.5" />
          <span>{agents.length} Agents</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1 bg-console-warning/20 text-console-warning border-0">
              {activeCount} active
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="hidden md:flex font-mono text-[10px] gap-1 bg-primary/10 text-primary border-0">
          <Zap className="w-3 h-3" />
          Connected
        </Badge>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex gap-1.5 text-xs text-muted-foreground h-8"
          onClick={() => {}}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 font-mono text-xs h-8"
          onClick={() => navigate('/execute')}
        >
          <Terminal className="h-3.5 w-3.5" />
          Execute
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex gap-1.5 text-xs text-muted-foreground h-8"
          onClick={() => {}}
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Upgrade
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => {}}
        >
          <Rocket className="h-3.5 w-3.5" />
          Publish
        </Button>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
