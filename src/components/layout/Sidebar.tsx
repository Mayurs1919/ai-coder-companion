import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Code2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Bot,
  ScrollText,
  Settings,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/dashboard/agents', icon: Bot, label: 'Agents' },
  { path: '/dashboard/logs', icon: ScrollText, label: 'Logs' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">AI Engine</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center mx-auto">
            <Code2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="px-2 py-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/dashboard');

          const link = (
            <NavLink
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                'hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-primary')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{link}</div>;
        })}
      </nav>

      {/* Quick Execute */}
      <div className="p-2 border-t border-sidebar-border">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to="/execute"
                className="flex items-center justify-center p-2.5 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Terminal className="h-4 w-4" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">
              Execute
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to="/execute"
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Terminal className="h-4 w-4" />
            <span>Execute</span>
          </NavLink>
        )}
      </div>

      {/* Version */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground/50 font-mono">v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
