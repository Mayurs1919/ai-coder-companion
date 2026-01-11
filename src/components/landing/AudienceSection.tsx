import { motion } from 'framer-motion';
import { Code, TestTube, GitBranch, Building2, Rocket } from 'lucide-react';

const audiences = [
  {
    icon: Code,
    title: 'Developers',
    description: 'Write and refactor code faster with AI that understands architecture.',
  },
  {
    icon: TestTube,
    title: 'QA Engineers',
    description: 'Generate comprehensive test suites with edge case coverage.',
  },
  {
    icon: GitBranch,
    title: 'Tech Leads',
    description: 'Get instant code reviews and architecture guidance.',
  },
  {
    icon: Building2,
    title: 'Architects',
    description: 'Design microservices and API structures at scale.',
  },
  {
    icon: Rocket,
    title: 'Startups',
    description: 'Move from idea to production rapidly.',
  },
];

export function AudienceSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background">
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
            <span className="text-foreground">Built For</span>{' '}
            <span className="text-primary">Builders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're shipping features or designing systems, we've got you covered.
          </p>
        </motion.div>

        {/* Audience cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex flex-col items-center p-6 rounded-2xl border border-border bg-card/50 backdrop-blur w-44 text-center group cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <audience.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{audience.title}</h3>
              <p className="text-xs text-muted-foreground">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
