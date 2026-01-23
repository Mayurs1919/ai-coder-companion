import { motion } from 'framer-motion';
import { Cpu, GitBranch, Target, FileCode, Layers } from 'lucide-react';

const engineFeatures = [
  {
    icon: Target,
    title: 'Intent-Based Agent Routing',
    description: 'The orchestrator detects user intent and routes to the optimal agent automatically. No manual agent selection required.',
  },
  {
    icon: GitBranch,
    title: 'Zero Configuration Dispatch',
    description: 'Users describe what they need — the engine determines which specialized agent handles the task.',
  },
  {
    icon: Layers,
    title: 'Deterministic Outputs',
    description: 'Every agent produces consistent, reproducible results. Same input, same structured output.',
  },
  {
    icon: FileCode,
    title: 'Artifact-First Results',
    description: 'Every response is a deliverable: code files, documentation, tables, or structured data — not prose.',
  },
];

export function AIEngineSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              An AI Engine That Thinks Like an IDE
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              The kernel architecture treats AI agents as specialized subsystems, orchestrated by a central dispatcher that understands engineering context.
            </p>

            <div className="space-y-6">
              {engineFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Kernel diagram */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Orchestrator core */}
            <div className="relative bg-card/50 rounded-2xl border border-border p-8 backdrop-blur">
              {/* Center - Orchestrator */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  className="w-24 h-24 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center mb-4 relative"
                  animate={{ boxShadow: ['0 0 20px hsl(var(--primary) / 0.3)', '0 0 40px hsl(var(--primary) / 0.5)', '0 0 20px hsl(var(--primary) / 0.3)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Cpu className="w-10 h-10 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-console-success shadow-lg shadow-console-success/50" />
                </motion.div>
                <span className="text-sm font-semibold text-foreground">Agent Orchestrator</span>
                <span className="text-xs text-muted-foreground">Central Kernel</span>
              </div>

              {/* Agent subsystems */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  'Code Writer',
                  'Refactor',
                  'Bug Fix',
                  'PR Review',
                  'Docs',
                  'API',
                  'Architecture',
                  'Security',
                  'Analytics'
                ].map((agent, index) => (
                  <motion.div
                    key={agent}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center hover:border-primary/30 hover:bg-muted/50 transition-all cursor-default"
                  >
                    <span className="text-xs font-medium text-muted-foreground">{agent}</span>
                  </motion.div>
                ))}
              </div>

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
