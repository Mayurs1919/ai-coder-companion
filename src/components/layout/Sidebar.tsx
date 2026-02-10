import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Code2,
  Wand2,
  Bug,
  FlaskConical,
  GitPullRequest,
  FileText,
  Network,
  Webhook,
  Boxes,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Shield,
  Wrench,
  TestTube2,
  BookOpen,
  BarChart3,
  FileUser,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      title: 'BUILD',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/agent/code-writer', icon: Code2, label: 'Code Writer', color: 'agent-code-writer' },
        { path: '/agent/refactor', icon: Wand2, label: 'Code Refactor', color: 'agent-refactor' },
        { path: '/agent/sys-engineer', icon: FileText, label: 'SysEngineer', color: 'agent-docs' },
        { path: '/agent/usage', icon: BarChart3, label: 'Usage', color: 'agent-usage' },
      ],
    },
    {
      title: 'QUALITY',
      items: [
        { path: '/agent/debug', icon: Bug, label: 'Bug Finder', color: 'agent-debug' },
        { path: '/agent/api', icon: Webhook, label: 'API Structure', color: 'agent-api' },
        { path: '/agent/microservices', icon: Boxes, label: 'Microservices', color: 'agent-microservices' },
      ],
    },
    {
      title: 'REVIEW & DOCS',
      items: [
        { path: '/agent/docs', icon: BookOpen, label: 'Documentation', color: 'agent-docs' },
        { path: '/agent/reviewer', icon: GitPullRequest, label: 'PR Reviewer', color: 'agent-reviewer' },
        { path: '/security', icon: Shield, label: 'Security Scan', color: 'agent-security' },
      ],
    },
    {
      title: 'AI AGENTS',
      items: [
        { path: '/agent/resume-ai', icon: FileUser, label: 'Resume AI', color: 'agent-resume' },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-sidebar-foreground">AI Code Agent</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title} className={cn(sectionIndex > 0 && 'mt-4')}>
            {/* Section Title */}
            {!collapsed && (
              <div className="px-4 py-2">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/70">
                  {section.title}
                </span>
              </div>
            )}
            {collapsed && sectionIndex > 0 && (
              <div className="mx-3 my-2 border-t border-sidebar-border" />
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                const linkContent = (
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        item.color && isActive ? `text-${item.color}` : ''
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <li key={item.path}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                return <li key={item.path}>{linkContent}</li>;
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground">
            <p>Powered by Lovable AI</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}
