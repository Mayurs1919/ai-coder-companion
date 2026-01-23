import { motion } from 'framer-motion';
import { ArrowRight, Zap, GitBranch, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Theme toggle - fixed top right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Matte dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Animated workflow pulse lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-console-success/30 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating energy orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-console-success shadow-lg shadow-console-success/50"
        animate={{
          y: [0, 15, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur mb-10"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-console-success animate-pulse" />
            <span className="text-xs font-mono text-console-success uppercase tracking-wider">System Online</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <span className="text-sm text-muted-foreground font-medium">AI-Powered IDE Engine</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight"
        >
          <span className="text-foreground">Flexible AI Workflow Automation</span>
          <br />
          <span className="text-primary">for Engineering Teams</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Build, orchestrate, and scale AI-driven engineering workflows — 
          with <span className="text-foreground font-medium">IDE-grade control</span> and{' '}
          <span className="text-foreground font-medium">transparency</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="text-base px-8 py-6 bg-primary hover:bg-primary/90 group font-medium"
            onClick={() => navigate('/auth')}
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 border-border hover:bg-card hover:border-primary/50 font-medium"
            onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <GitBranch className="w-5 h-5 mr-2" />
            View Architecture
          </Button>
        </motion.div>

        {/* Key metrics bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {[
            { icon: Zap, label: 'Speed', value: 'Real-time' },
            { icon: Activity, label: 'Control', value: 'Full Visibility' },
            { icon: GitBranch, label: 'Intelligence', value: 'Multi-Agent' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
                <div className="text-sm font-semibold text-foreground">{item.value}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1 h-1 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
