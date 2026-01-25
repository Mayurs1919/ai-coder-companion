import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Zap } from 'lucide-react';

export type ExecutionState = 
  | 'idle'
  | 'analyzing'
  | 'routing'
  | 'executing'
  | 'rendering'
  | 'complete'
  | 'error';

interface ExecutionStatusProps {
  state: ExecutionState;
  className?: string;
}

const statusConfig: Record<ExecutionState, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  animate?: boolean;
}> = {
  idle: {
    label: 'Ready',
    icon: Zap,
    color: 'text-muted-foreground',
  },
  analyzing: {
    label: 'Analyzing request...',
    icon: Loader2,
    color: 'text-primary',
    animate: true,
  },
  routing: {
    label: 'Routing execution...',
    icon: Loader2,
    color: 'text-primary',
    animate: true,
  },
  executing: {
    label: 'Executing...',
    icon: Loader2,
    color: 'text-primary',
    animate: true,
  },
  rendering: {
    label: 'Rendering artifact...',
    icon: Loader2,
    color: 'text-accent',
    animate: true,
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    color: 'text-console-success',
  },
  error: {
    label: 'Execution failed',
    icon: XCircle,
    color: 'text-destructive',
  },
};

export function ExecutionStatus({ state, className }: ExecutionStatusProps) {
  const config = statusConfig[state];
  const Icon = config.icon;

  if (state === 'idle') return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Icon 
        className={cn(
          'w-4 h-4',
          config.color,
          config.animate && 'animate-spin'
        )} 
      />
      <span className={cn('font-medium', config.color)}>
        {config.label}
      </span>
    </div>
  );
}
