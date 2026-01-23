import { motion } from 'framer-motion';
import { 
  Code2, 
  RefreshCw, 
  Bug, 
  GitPullRequest, 
  Webhook, 
  Boxes, 
  FileText, 
  ClipboardList, 
  Shield,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const agentModules = [
  {
    id: 'code-writer',
    name: 'Code Writer',
    description: 'Generates production-ready code in any language',
    icon: Code2,
    status: 'ready',
    capabilities: ['Multi-language', 'Best practices', 'Clean architecture'],
  },
  {
    id: 'refactor',
    name: 'Code Refactor',
    description: 'Improves structure without changing behavior',
    icon: RefreshCw,
    status: 'ready',
    capabilities: ['SOLID principles', 'DRY patterns', 'Performance'],
  },
  {
    id: 'bug-fix',
    name: 'Bug Fixer',
    description: 'Identifies and resolves code issues',
    icon: Bug,
    status: 'ready',
    capabilities: ['Error detection', 'Root cause', 'Fix generation'],
  },
  {
    id: 'pr-reviewer',
    name: 'PR Reviewer',
    description: 'Senior-level code review feedback',
    icon: GitPullRequest,
    status: 'ready',
    capabilities: ['Diff analysis', 'Security', 'Quality score'],
  },
  {
    id: 'api',
    name: 'API Structure',
    description: 'Designs RESTful and GraphQL APIs',
    icon: Webhook,
    status: 'ready',
    capabilities: ['Endpoint design', 'Schema', 'Documentation'],
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'Designs distributed service architecture',
    icon: Boxes,
    status: 'ready',
    capabilities: ['Service boundaries', 'Communication', 'Scalability'],
  },
  {
    id: 'docs',
    name: 'Documentation',
    description: 'Generates technical documentation',
    icon: FileText,
    status: 'ready',
    capabilities: ['API docs', 'Guides', 'Comments'],
  },
  {
    id: 'sys-engineer',
    name: 'System Engineer',
    description: 'Generates use cases, requirements, tests',
    icon: ClipboardList,
    status: 'ready',
    capabilities: ['Use cases', 'Requirements', 'Traceability'],
  },
  {
    id: 'security',
    name: 'Security Scan',
    description: 'Audits code for vulnerabilities',
    icon: Shield,
    status: 'ready',
    capabilities: ['OWASP', 'CVE detection', 'Compliance'],
  },
  {
    id: 'analytics',
    name: 'Usage Analytics',
    description: 'Tracks agent performance and usage',
    icon: BarChart3,
    status: 'ready',
    capabilities: ['Metrics', 'Cost tracking', 'Insights'],
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'ready':
      return { icon: CheckCircle2, color: 'text-console-success', bg: 'bg-console-success/10', label: 'Ready' };
    case 'running':
      return { icon: Clock, color: 'text-console-warning', bg: 'bg-console-warning/10', label: 'Running' };
    case 'coming':
      return { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted/20', label: 'Coming Soon' };
    default:
      return { icon: CheckCircle2, color: 'text-console-success', bg: 'bg-console-success/10', label: 'Ready' };
  }
};

export function AgentDashboardSection() {
  return (
    <section id="agents" className="py-24 bg-muted/10 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Agent Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional IDE modules — specialized AI subsystems that power intelligent engineering workflows.
          </p>
        </motion.div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {agentModules.map((agent, index) => {
            const statusConfig = getStatusConfig(agent.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full bg-card/60 backdrop-blur border-border hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <agent.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                        <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>
                    </div>

                    {/* Name & description */}
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((cap) => (
                        <Badge
                          key={cap}
                          variant="secondary"
                          className="text-[10px] font-normal px-1.5 py-0 bg-muted/50"
                        >
                          {cap}
                        </Badge>
                      ))}
                    </div>

                    {/* Health indicator */}
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Health</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-console-success" />
                          <div className="w-1.5 h-1.5 rounded-full bg-console-success" />
                          <div className="w-1.5 h-1.5 rounded-full bg-console-success" />
                          <div className="w-1.5 h-1.5 rounded-full bg-console-success" />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Agents are internal subsystems — dispatched automatically based on user intent.
        </motion.p>
      </div>
    </section>
  );
}
