import { motion } from 'framer-motion';
import { BarChart3, Eye, Clock, DollarSign, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const metrics = [
  { icon: Activity, label: 'Agent-wise Usage', value: 'Per-agent tracking' },
  { icon: DollarSign, label: 'Token Consumption', value: 'Cost awareness' },
  { icon: Clock, label: 'Time Saved', value: 'Productivity metrics' },
  { icon: TrendingUp, label: 'Re-run Rates', value: 'Optimization insights' },
  { icon: BarChart3, label: 'Output Quality', value: 'Success signals' },
];

const comparison = [
  { feature: 'Agent-level analytics', traditional: false, platform: true },
  { feature: 'Cost tracking per request', traditional: false, platform: true },
  { feature: 'Optimization insights', traditional: false, platform: true },
  { feature: 'Trust & transparency', traditional: false, platform: true },
  { feature: 'Real-time visibility', traditional: false, platform: true },
];

export function AnalyticsComparisonSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
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
            Full Visibility. Real Intelligence.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlike black-box AI tools, this platform provides complete transparency into agent performance and usage.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-card/50 border-border h-full">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <metric.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{metric.label}</h3>
                    <p className="text-xs text-muted-foreground">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-card/50 border-border overflow-hidden">
              <div className="px-6 py-4 bg-muted/30 border-b border-border">
                <h3 className="font-semibold text-foreground">Traditional IDE Agents vs This Platform</h3>
              </div>
              <div className="divide-y divide-border">
                {/* Header row */}
                <div className="grid grid-cols-3 px-6 py-3 bg-muted/10 text-sm font-medium">
                  <span className="text-muted-foreground">Feature</span>
                  <span className="text-center text-muted-foreground">IDE Agents</span>
                  <span className="text-center text-primary">This Platform</span>
                </div>

                {/* Data rows */}
                {comparison.map((row) => (
                  <div key={row.feature} className="grid grid-cols-3 px-6 py-3 items-center">
                    <span className="text-sm text-foreground">{row.feature}</span>
                    <div className="flex justify-center">
                      <XCircle className="w-5 h-5 text-destructive/70" />
                    </div>
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-5 h-5 text-console-success" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
