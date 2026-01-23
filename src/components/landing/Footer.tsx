import { FileText, GitBranch, Shield, Github, MessageSquare, Mail, Activity } from 'lucide-react';

const footerLinks = [
  { label: 'Docs', href: '#', icon: FileText },
  { label: 'Architecture', href: '#architecture', icon: GitBranch },
  { label: 'Security', href: '#', icon: Shield },
  { label: 'GitHub', href: '#', icon: Github },
  { label: 'Community', href: '#', icon: MessageSquare },
  { label: 'Contact', href: '#', icon: Mail },
];

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Logo & Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">AI Code Agent</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-console-success/10 border border-console-success/20">
              <div className="w-1.5 h-1.5 rounded-full bg-console-success animate-pulse" />
              <span className="text-xs font-medium text-console-success">Status: Operational</span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <link.icon className="w-3 h-3" />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Code Agent
          </p>
        </div>
      </div>
    </footer>
  );
}
