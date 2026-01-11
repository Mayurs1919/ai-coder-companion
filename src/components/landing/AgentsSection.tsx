import { motion } from 'framer-motion';
import { 
  Code2, 
  RefreshCw, 
  Bug, 
  TestTube2, 
  Eye, 
  FileText, 
  Boxes, 
  Network,
  Shield,
  Workflow
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const agents = [
  {
    icon: Code2,
    name: 'Code Writer',
    description: 'Generates clean, production-ready code in any language with proper structure and best practices.',
    color: 'hsl(var(--agent-code-writer))',
  },
  {
    icon: RefreshCw,
    name: 'Code Refactor',
    description: 'Improves structure without changing behavior — applies SOLID principles, DRY, and design patterns.',
    color: 'hsl(var(--agent-refactor))',
  },
  {
    icon: Bug,
    name: 'Bug Finder',
    description: 'Identifies vulnerabilities, logic errors, edge cases, and potential runtime issues.',
    color: 'hsl(var(--agent-debug))',
  },
  {
    icon: TestTube2,
    name: 'Test Generator',
    description: 'Creates comprehensive unit, integration, and edge-case tests with full coverage.',
    color: 'hsl(var(--agent-test-gen))',
  },
  {
    icon: Eye,
    name: 'Code Reviewer',
    description: 'Provides senior-level code review feedback with actionable suggestions.',
    color: 'hsl(var(--agent-reviewer))',
  },
  {
    icon: FileText,
    name: 'Documentation',
    description: 'Generates clear technical documentation, API docs, and inline comments.',
    color: 'hsl(var(--agent-docs))',
  },
  {
    icon: Boxes,
    name: 'Architecture',
    description: 'Designs system architecture with scalability, maintainability, and performance in mind.',
    color: 'hsl(var(--agent-architecture))',
  },
  {
    icon: Network,
    name: 'API Designer',
    description: 'Structures RESTful and GraphQL APIs with proper endpoints and documentation.',
    color: 'hsl(var(--agent-api))',
  },
  {
    icon: Workflow,
    name: 'Microservices',
    description: 'Designs scalable, decoupled service architectures with proper boundaries.',
    color: 'hsl(var(--agent-microservices))',
  },
  {
    icon: Shield,
    name: 'Security Auditor',
    description: 'Scans for vulnerabilities, security anti-patterns, and compliance issues.',
    color: 'hsl(var(--destructive))',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AgentsSection() {
  return (
    <section id="agents" className="py-24 bg-gradient-to-b from-background to-secondary/20">
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
            <span className="text-foreground">Specialized Agents.</span>{' '}
            <span className="text-primary">Expert Results.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each agent masters one domain, delivering expert-level output instead of generic responses.
          </p>
        </motion.div>

        {/* Agents grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {agents.map((agent, index) => (
            <motion.div key={agent.name} variants={itemVariants}>
              <Card className="h-full bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${agent.color}20` }}
                  >
                    <agent.icon 
                      className="w-6 h-6" 
                      style={{ color: agent.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
