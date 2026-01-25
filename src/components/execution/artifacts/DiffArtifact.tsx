import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  GitCompare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Paintbrush
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'info';
  content: string;
  lineNumber?: number;
  category?: 'logic' | 'formatting' | 'security' | 'risky';
  comment?: string;
}

interface DiffArtifactProps {
  title: string;
  filename: string;
  lines: DiffLine[];
  stats: {
    additions: number;
    deletions: number;
    logicChanges: number;
    securityIssues: number;
  };
  onExpand?: () => void;
}

export function DiffArtifact({ title, filename, lines, stats, onExpand }: DiffArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleCopy = async () => {
    const diffText = lines.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      return `${prefix} ${line.content}`;
    }).join('\n');
    await navigator.clipboard.writeText(diffText);
    setCopied(true);
    toast.success('Diff copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'security': return <Shield className="w-3 h-3 text-destructive" />;
      case 'risky': return <AlertTriangle className="w-3 h-3 text-console-warning" />;
      case 'formatting': return <Paintbrush className="w-3 h-3 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3">
          <GitCompare className="w-4 h-4 text-console-warning" />
          <span className="text-sm font-mono text-foreground">{filename}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-console-success">
              +{stats.additions}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-destructive">
              -{stats.deletions}
            </Badge>
            {stats.logicChanges > 0 && (
              <Badge variant="outline" className="text-[10px] text-primary">
                {stats.logicChanges} logic
              </Badge>
            )}
            {stats.securityIssues > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {stats.securityIssues} security
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-4 h-4 text-console-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          {onExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onExpand}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Diff Content */}
      {!collapsed && (
        <ScrollArea className="h-[350px]">
          <div className="font-mono text-sm">
            {lines.map((line, index) => (
              <div key={index}>
                <div
                  className={cn(
                    'flex items-start gap-2 px-4 py-0.5',
                    line.type === 'added' && 'bg-console-success/10',
                    line.type === 'removed' && 'bg-destructive/10',
                    line.type === 'info' && 'bg-primary/5 text-primary text-xs py-2',
                    line.category === 'security' && 'border-l-2 border-destructive',
                    line.category === 'risky' && 'border-l-2 border-console-warning'
                  )}
                >
                  {/* Line Number */}
                  <span className="w-10 text-right text-muted-foreground/50 select-none flex-shrink-0">
                    {line.lineNumber || ''}
                  </span>

                  {/* Prefix */}
                  <span className={cn(
                    'w-4 flex-shrink-0 select-none font-bold',
                    line.type === 'added' && 'text-console-success',
                    line.type === 'removed' && 'text-destructive'
                  )}>
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>

                  {/* Content */}
                  <span className={cn(
                    'flex-1 whitespace-pre',
                    line.type === 'added' && 'text-console-success',
                    line.type === 'removed' && 'text-destructive'
                  )}>
                    {line.content}
                  </span>

                  {/* Category Icon */}
                  {line.category && (
                    <span className="flex-shrink-0">
                      {getCategoryIcon(line.category)}
                    </span>
                  )}
                </div>

                {/* Inline Comment */}
                {line.comment && (
                  <div className="px-4 py-2 ml-14 bg-muted/30 border-l-2 border-primary text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">Review:</span> {line.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
