import { Bell, Settings, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Left: Status indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-console-success status-pulse" />
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>10 Agents Ready</span>
        </div>
      </div>

      {/* Center: Current context */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Lovable AI Connected
        </Badge>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
