import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">AI Code Agent</span>
          </div>

          {/* Tagline */}
          <p className="text-muted-foreground text-sm text-center">
            Multi-Agent AI Engineering Platform — Built for developers who demand production-ready code.
          </p>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AI Code Agent
          </p>
        </div>
      </div>
    </footer>
  );
}
