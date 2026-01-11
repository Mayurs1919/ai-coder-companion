import { motion } from 'framer-motion';
import { Lightbulb, Users, FileCode, Rocket } from 'lucide-react';

const principles = [
  {
    icon: Lightbulb,
    title: 'Productivity Over Complexity',
    description: 'We eliminate boilerplate reasoning. Each agent delivers focused, actionable output — not walls of explanation.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-500',
  },
  {
    icon: Users,
    title: 'Agent-Driven Engineering',
    description: 'Specialized agents outperform generalist AI. Each agent masters one domain, producing expert-level results.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: FileCode,
    title: 'Artifact-First Output',
    description: 'Every response is a deliverable: a file you can copy, download, or integrate immediately into your project.',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-500',
  },
  {
    icon: Rocket,
    title: 'Real-World Usability',
    description: 'Code that compiles. Tests that run. Architecture that scales. Built for production, not demos.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500',
  },
];

export function IdeologySection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Our</span>{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Core Ideology</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The principles that guide every line of code our agents generate.
          </p>
        </motion.div>

        {/* Principles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border border-border bg-gradient-to-br ${principle.gradient} backdrop-blur`}
            >
              {/* Icon */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-background/50">
                  <principle.icon className={`w-8 h-8 ${principle.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className={`w-full h-full ${principle.iconColor} blur-2xl`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
