import { motion } from 'framer-motion';
import { Maximize2, Terminal, Layers, RefreshCw, Download, Eye } from 'lucide-react';

const features = [
  {
    icon: Maximize2,
    title: 'Auto-Expand Code View',
    description: 'Full visibility of generated artifacts with one-click expansion.',
  },
  {
    icon: Terminal,
    title: 'Console Logging',
    description: 'Real-time agent activity tracking and debugging.',
  },
  {
    icon: Layers,
    title: 'Specialized Agents',
    description: 'Expert-level output per domain, not generic responses.',
  },
  {
    icon: RefreshCw,
    title: 'Iterative Refinement',
    description: 'Chat-based workflow for continuous improvement.',
  },
  {
    icon: Download,
    title: 'Instant Export',
    description: 'Copy or download any generated artifact immediately.',
  },
  {
    icon: Eye,
    title: 'Syntax Highlighting',
    description: 'Beautiful code display with language-aware formatting.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Powerful</span>{' '}
            <span className="text-primary">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for a professional AI engineering workflow.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card/30 hover:bg-card/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
