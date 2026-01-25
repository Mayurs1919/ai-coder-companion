import { motion } from 'framer-motion';
import { ArrowRight, Zap, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden bg-muted/10">
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            There's Nothing You Can't Automate
          </h2>

          {/* Subtext */}
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            From code generation to architecture design — orchestrate intelligent engineering workflows at scale.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="text-base px-8 py-6 bg-primary hover:bg-primary/90 group font-medium"
                onClick={() => navigate('/execute')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Launch IDE Engine
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 border-border hover:bg-card hover:border-primary/50 font-medium"
              onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <GitBranch className="w-5 h-5 mr-2" />
              View Architecture
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
