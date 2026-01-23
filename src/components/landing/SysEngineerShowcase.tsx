import { motion } from 'framer-motion';
import { ClipboardList, FileText, TestTube2, GitBranch, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const useCases = [
  { id: 'UC-001', name: 'User Login', priority: 'High', status: 'Approved' },
  { id: 'UC-002', name: 'Password Reset', priority: 'Medium', status: 'Draft' },
  { id: 'UC-003', name: 'Profile Update', priority: 'Low', status: 'Approved' },
];

const requirements = [
  { id: 'REQ-001', ucId: 'UC-001', name: 'Email validation', type: 'Functional' },
  { id: 'REQ-002', ucId: 'UC-001', name: 'Session timeout', type: 'Non-Functional' },
  { id: 'REQ-003', ucId: 'UC-002', name: 'Token expiry', type: 'Security' },
];

const testCases = [
  { id: 'TC-001', reqId: 'REQ-001', name: 'Valid email accepted', type: 'Positive' },
  { id: 'TC-002', reqId: 'REQ-001', name: 'Invalid email rejected', type: 'Negative' },
  { id: 'TC-003', reqId: 'REQ-002', name: 'Session expires after 30m', type: 'Boundary' },
];

export function SysEngineerShowcase() {
  return (
    <section className="py-24 bg-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">System Engineer Agent</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Structured Engineering Workflow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate Use Cases, Requirements, Test Cases, and Traceability Matrix — in strict tabular format.
          </p>
        </motion.div>

        {/* Workflow stages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          {[
            { icon: FileText, label: 'Use Cases' },
            { icon: ClipboardList, label: 'Requirements' },
            { icon: TestTube2, label: 'Test Cases' },
            { icon: GitBranch, label: 'Traceability' },
          ].map((stage, index) => (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <stage.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{stage.label}</span>
              </div>
              {index < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />}
            </div>
          ))}
        </motion.div>

        {/* Tabbed tables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-card border-border overflow-hidden">
            <Tabs defaultValue="use-cases" className="w-full">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="use-cases" className="text-xs">Use Cases</TabsTrigger>
                  <TabsTrigger value="requirements" className="text-xs">Requirements</TabsTrigger>
                  <TabsTrigger value="test-cases" className="text-xs">Test Cases</TabsTrigger>
                  <TabsTrigger value="traceability" className="text-xs">Traceability</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="use-cases" className="m-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20">
                      <tr className="border-b border-border">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Priority</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {useCases.map((uc) => (
                        <tr key={uc.id} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="px-4 py-3 font-mono text-xs text-primary">{uc.id}</td>
                          <td className="px-4 py-3 text-foreground">{uc.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant={uc.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                              {uc.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={uc.status === 'Approved' ? 'default' : 'outline'} className="text-xs">
                              {uc.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="m-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20">
                      <tr className="border-b border-border">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">UC ID</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirements.map((req) => (
                        <tr key={req.id} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="px-4 py-3 font-mono text-xs text-primary">{req.id}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{req.ucId}</td>
                          <td className="px-4 py-3 text-foreground">{req.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">{req.type}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="test-cases" className="m-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20">
                      <tr className="border-b border-border">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">REQ ID</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testCases.map((tc) => (
                        <tr key={tc.id} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="px-4 py-3 font-mono text-xs text-primary">{tc.id}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tc.reqId}</td>
                          <td className="px-4 py-3 text-foreground">{tc.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs">{tc.type}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="traceability" className="m-0 p-6">
                <div className="text-center text-muted-foreground">
                  <GitBranch className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-sm">Full traceability matrix linking Test Cases → Requirements → Use Cases</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          No chat bubbles. No explanations. Strict table layouts only.
        </motion.p>
      </div>
    </section>
  );
}
