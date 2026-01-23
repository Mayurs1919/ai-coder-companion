import { motion } from 'framer-motion';
import { Clock, GitPullRequest, TestTube2, Webhook, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const metrics = [
  {
    icon: Clock,
    value: '1,000+',
    unit: 'hours',
    label: 'Engineering Hours Saved',
    change: '+340%',
    changeType: 'positive',
    description: 'Automated boilerplate generation and refactoring',
  },
  {
    icon: GitPullRequest,
    value: '60%',
    unit: 'faster',
    label: 'PR Review Time Reduction',
    change: '-60%',
    changeType: 'positive',
    description: 'AI-powered diff analysis and security scanning',
  },
  {
    icon: TestTube2,
    value: 'Minutes',
    unit: '',
    label: 'Full Test Matrix Generation',
    change: 'vs days',
    changeType: 'positive',
    description: 'Complete test coverage from requirements',
  },
  {
    icon: Webhook,
    value: '1',
    unit: 'prompt',
    label: 'Production-Ready APIs',
    change: 'instant',
    changeType: 'positive',
    description: 'RESTful endpoints with documentation',
  },
];

export function CaseStudiesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

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
            Engineering Impact
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real metrics from production use — not marketing claims.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <metric.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="w-3 h-3 text-console-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <span className="text-xs font-medium text-console-success">{metric.change}</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                    {metric.unit && (
                      <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
                    )}
                  </div>

                  {/* Label */}
                  <h3 className="font-medium text-foreground mb-2">{metric.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{metric.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <Card className="bg-card/30 border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground text-sm">Productivity Trend</h3>
            </div>
            <div className="p-6">
              {/* Simple bar visualization */}
              <div className="space-y-4">
                {[
                  { label: 'Code Generation', value: 92 },
                  { label: 'Documentation', value: 87 },
                  { label: 'Code Review', value: 78 },
                  { label: 'Test Generation', value: 85 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
