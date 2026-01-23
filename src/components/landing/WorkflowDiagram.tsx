import { motion } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  Cpu, 
  CheckCircle2,
  Github,
  FileText,
  Database,
  MessageSquare,
  Upload
} from 'lucide-react';

const workflowNodes = [
  {
    id: 'trigger',
    label: 'Trigger',
    description: 'Event-driven activation',
    icon: Zap,
    integrations: [
      { name: 'GitHub', icon: Github },
      { name: 'Slack', icon: MessageSquare },
      { name: 'File Upload', icon: Upload },
    ],
  },
  {
    id: 'preprocess',
    label: 'Pre-process',
    description: 'Input validation & parsing',
    icon: Settings,
    integrations: [
      { name: 'Documents', icon: FileText },
      { name: 'Drive', icon: Database },
    ],
  },
  {
    id: 'engine',
    label: 'AI Engine',
    description: 'Multi-agent orchestration',
    icon: Cpu,
    isPrimary: true,
    integrations: [],
  },
  {
    id: 'postprocess',
    label: 'Post-process',
    description: 'Artifact generation & output',
    icon: CheckCircle2,
    integrations: [
      { name: 'Jira', icon: FileText },
      { name: 'Sheets', icon: Database },
    ],
  },
];

export function WorkflowDiagram() {
  return (
    <section id="architecture" className="py-24 bg-muted/10 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            IDE-Style Workflow Orchestration
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A visual representation of the Agent Orchestrator kernel — the core engine that powers intelligent workflow automation.
          </p>
        </motion.div>

        {/* Workflow diagram */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
            {workflowNodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-4">
                {/* Node card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`
                    relative p-6 rounded-xl border backdrop-blur
                    ${node.isPrimary 
                      ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/20' 
                      : 'bg-card/50 border-border hover:border-primary/30'
                    }
                    transition-all duration-300 group min-w-[180px]
                  `}
                >
                  {/* Status indicator */}
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-console-success shadow-lg shadow-console-success/50" />

                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mb-4
                    ${node.isPrimary ? 'bg-primary/20' : 'bg-muted/50'}
                  `}>
                    <node.icon className={`w-6 h-6 ${node.isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>

                  {/* Label */}
                  <h3 className={`font-semibold mb-1 ${node.isPrimary ? 'text-primary' : 'text-foreground'}`}>
                    {node.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {node.description}
                  </p>

                  {/* Integration icons */}
                  {node.integrations.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
                      {node.integrations.map((integration) => (
                        <div
                          key={integration.name}
                          className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center"
                          title={integration.name}
                        >
                          <integration.icon className="w-3 h-3 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Primary node glow */}
                  {node.isPrimary && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-primary/5 blur-xl -z-10"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Connector line */}
                {index < workflowNodes.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                    className="hidden lg:block w-12 h-px bg-gradient-to-r from-border via-primary/50 to-border origin-left"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Supported integrations bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 p-4 rounded-lg bg-card/30 border border-border/50"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="uppercase tracking-wider font-medium">Supported:</span>
              {['GitHub', 'Slack', 'Google Drive', 'Google Sheets', 'Jira', 'Internal APIs', 'PDF', 'DOCX', 'ZIP'].map((name) => (
                <span key={name} className="px-2 py-1 rounded bg-muted/30 font-mono">{name}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
