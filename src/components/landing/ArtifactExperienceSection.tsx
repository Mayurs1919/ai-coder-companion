import { motion } from 'framer-motion';
import { Terminal, Maximize2, Copy, Download, Code2, FileText, Table, GitCompare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const outputTypes = [
  { icon: Code2, label: 'Code', description: 'Rendered in code editor view' },
  { icon: FileText, label: 'Docs', description: 'Displayed in document viewer' },
  { icon: Table, label: 'Tables', description: 'Structured tabular format' },
  { icon: GitCompare, label: 'Reviews', description: 'Inline diff annotations' },
];

export function ArtifactExperienceSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Demo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Console input */}
            <Card className="bg-card border-border overflow-hidden mb-4">
              <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">IDE Console</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-mono text-sm">→</span>
                  <span className="font-mono text-sm text-foreground">"Write a Python Fibonacci program"</span>
                </div>
              </div>
            </Card>

            {/* Agent detection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pl-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-console-success animate-pulse" />
              <span className="font-mono">Intent detected → Code Writer invoked → Artifact rendered</span>
            </motion.div>

            {/* Artifact output */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="bg-card border-border overflow-hidden">
                {/* Editor header */}
                <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono text-foreground">fibonacci.py</span>
                    <Badge variant="secondary" className="text-[10px]">Python</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Code content */}
                <div className="p-4 font-mono text-xs leading-relaxed">
                  <div><span className="text-syntax-keyword">def</span> <span className="text-syntax-function">fibonacci</span>(n: <span className="text-syntax-type">int</span>) -&gt; <span className="text-syntax-type">list</span>[<span className="text-syntax-type">int</span>]:</div>
                  <div className="text-syntax-comment pl-4">    """Generate Fibonacci sequence."""</div>
                  <div className="pl-4">    <span className="text-syntax-keyword">if</span> n &lt;= <span className="text-syntax-number">0</span>:</div>
                  <div className="pl-8">        <span className="text-syntax-keyword">return</span> []</div>
                  <div className="pl-4">    <span className="text-syntax-keyword">elif</span> n == <span className="text-syntax-number">1</span>:</div>
                  <div className="pl-8">        <span className="text-syntax-keyword">return</span> [<span className="text-syntax-number">0</span>]</div>
                  <div className="pl-4">    </div>
                  <div className="pl-4">    sequence = [<span className="text-syntax-number">0</span>, <span className="text-syntax-number">1</span>]</div>
                  <div className="pl-4">    <span className="text-syntax-keyword">for</span> _ <span className="text-syntax-keyword">in</span> <span className="text-syntax-function">range</span>(<span className="text-syntax-number">2</span>, n):</div>
                  <div className="pl-8">        sequence.append(sequence[-<span className="text-syntax-number">1</span>] + sequence[-<span className="text-syntax-number">2</span>])</div>
                  <div className="pl-4">    <span className="text-syntax-keyword">return</span> sequence</div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right: Output rules */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Conversation → Artifact
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Single command-style input. The engine detects intent, invokes the right agent, and renders the artifact.
            </p>

            {/* Output type rules */}
            <div className="space-y-4 mb-8">
              {outputTypes.map((type, index) => (
                <motion.div
                  key={type.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/50"
                >
                  <div className="p-2 rounded bg-primary/10">
                    <type.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{type.label}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="text-sm text-muted-foreground">{type.description}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Artifact actions */}
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-3">Every artifact includes:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Maximize2, label: 'Expand (fullscreen)' },
                  { icon: Copy, label: 'Copy (content)' },
                  { icon: Download, label: 'Download (TXT/DOCX/ZIP)' },
                ].map((action) => (
                  <div
                    key={action.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/30 text-xs"
                  >
                    <action.icon className="w-3 h-3 text-primary" />
                    <span className="text-foreground">{action.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
