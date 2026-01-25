import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface DocumentSection {
  title: string;
  content: string;
}

interface DocumentArtifactProps {
  title: string;
  sections: DocumentSection[];
  onExpand?: () => void;
}

export function DocumentArtifact({ title, sections, onExpand }: DocumentArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fullContent = sections
    .map(s => `## ${s.title}\n\n${s.content}`)
    .join('\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast.success('Document copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">{title}</span>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            Documentation
          </Badge>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
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

      {/* Content */}
      {!collapsed && (
        <ScrollArea className="h-[350px]">
          <div className="p-6 space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-base font-semibold text-foreground border-b border-border/50 pb-2">
                  {section.title}
                </h3>
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
