import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X, Brain, Target, Star } from 'lucide-react';

interface ResumeResultPanelProps {
  report: string;
  action: string;
  onClose: () => void;
}

const actionMeta: Record<string, { label: string; icon: typeof Brain }> = {
  analyze: { label: 'Resume Analysis', icon: Brain },
  match: { label: 'Match Report', icon: Target },
  score: { label: 'Score Report', icon: Star },
};

export function ResumeResultPanel({ report, action, onClose }: ResumeResultPanelProps) {
  const meta = actionMeta[action] || actionMeta.analyze;
  const Icon = meta.icon;

  // Parse sections from the report for styled rendering
  const sections = parseSections(report);

  return (
    <Card className="animate-fade-in border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {meta.label}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {sections.map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <h3 className="text-sm font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {section.heading}
                  </h3>
                )}
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface Section {
  heading: string | null;
  body: string;
}

function parseSections(text: string): Section[] {
  // Split on numbered headings like "1) Match Overview" or "## Match Overview" or bold **Match Overview**
  const lines = text.split('\n');
  const sections: Section[] = [];
  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const headingPattern = /^(?:\d+\)\s*|#{1,3}\s*|\*\*)(.*?)(?:\*\*)?$/;

  for (const line of lines) {
    const match = line.trim().match(headingPattern);
    if (match && match[1]?.trim().length > 2 && match[1].trim().length < 80) {
      if (currentHeading !== null || currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = match[1].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeading !== null || currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
  }

  return sections.filter(s => s.body.length > 0 || s.heading);
}
