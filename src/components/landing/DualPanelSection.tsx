import { motion } from 'framer-motion';
import { Terminal, Layout, Github, Cloud, Lock, Eye, Code2, Workflow } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function DualPanelSection() {
  return (
    <section className="py-24 bg-muted/10 relative overflow-hidden">
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
            Code or Visual — Your Choice
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build with CLI commands and config files, or wire workflows visually in the IDE UI.
          </p>
        </motion.div>

        {/* Dual panels */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Code Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-card border-border overflow-hidden h-full">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Build with Code</span>
                <span className="text-xs text-muted-foreground ml-auto">Open Source</span>
              </div>
              <div className="p-6">
                {/* Code examples */}
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-muted-foreground mb-1"># CLI usage</div>
                    <div className="text-foreground">$ ai-agent run code-writer --prompt "..."</div>
                  </div>
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-muted-foreground mb-1"># Config file</div>
                    <div className="text-syntax-keyword">agents:</div>
                    <div className="pl-2 text-syntax-function">- code-writer</div>
                    <div className="pl-2 text-syntax-function">- reviewer</div>
                    <div className="text-syntax-keyword">output:</div>
                    <div className="pl-2 text-foreground">format: json</div>
                  </div>
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-muted-foreground mb-1"># API call</div>
                    <div className="text-foreground">POST /api/v1/agents/execute</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Github, label: 'Open Source Core' },
                      { icon: Terminal, label: 'CLI First' },
                      { icon: Code2, label: 'YAML/JSON Config' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <item.icon className="w-3 h-3" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Visual Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-card border-border overflow-hidden h-full">
              <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Build Visually</span>
                <span className="text-xs text-primary ml-auto">IDE UI</span>
              </div>
              <div className="p-6">
                {/* Visual workflow representation */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">Workflow Canvas</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-console-success" />
                        <span className="text-xs text-muted-foreground">Live</span>
                      </div>
                    </div>
                    {/* Mini workflow diagram */}
                    <div className="flex items-center justify-center gap-2">
                      {['Trigger', 'Process', 'Output'].map((node, i) => (
                        <div key={node} className="flex items-center gap-2">
                          <div className="px-3 py-2 rounded bg-card border border-border text-xs text-foreground">
                            {node}
                          </div>
                          {i < 2 && <div className="w-4 h-px bg-primary/50" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Workflow className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Node Wiring</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Drag agents onto canvas, connect inputs/outputs, preview results in real-time.
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Eye, label: 'Artifact Preview' },
                      { icon: Cloud, label: 'Cloud Deploy' },
                      { icon: Lock, label: 'Secure Execution' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <item.icon className="w-3 h-3" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
