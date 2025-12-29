import { useNavigate } from 'react-router-dom';
import { Agent } from '@/types/agents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Code2,
  Wand2,
  Bug,
  FlaskConical,
  Play,
  GitPullRequest,
  FileText,
  Network,
  Webhook,
  Boxes,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Wand2,
  Bug,
  FlaskConical,
  Play,
  GitPullRequest,
  FileText,
  Network,
  Webhook,
  Boxes,
};

interface AgentCardProps {
  agent: Agent;
  index: number;
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[agent.icon] || Code2;

  const getStatusColor = () => {
    switch (agent.status) {
      case 'processing':
        return 'bg-console-warning';
      case 'success':
        return 'bg-console-success';
      case 'error':
        return 'bg-console-error';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (agent.status) {
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:border-primary/50 group',
        'agent-glow hover:scale-[1.02]'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
              `bg-${agent.color}/20 group-hover:bg-${agent.color}/30`
            )}
          >
            <Icon className={cn('w-5 h-5', `text-${agent.color}`)} />
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                getStatusColor(),
                agent.status === 'processing' && 'status-pulse'
              )}
            />
            <span className="text-xs text-muted-foreground">{getStatusText()}</span>
          </div>
        </div>
        <CardTitle className="text-base mt-3">{agent.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary" className="text-xs">
            AI Powered
          </Badge>
          {agent.lastActivity && (
            <span className="text-muted-foreground">
              {new Date(agent.lastActivity).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
