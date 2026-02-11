import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import type { ResumeRecord } from '../ResumeAIWorkspace';

interface ResumeListPanelProps {
  resumes: ResumeRecord[];
  selectedResume: ResumeRecord | null;
  onSelect: (r: ResumeRecord) => void;
}

export function ResumeListPanel({ resumes, selectedResume, onSelect }: ResumeListPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Uploaded Resumes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No resumes uploaded yet
          </p>
        ) : (
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    selectedResume?.id === r.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/30 hover:bg-muted/50'
                  )}
                >
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.file_type.toUpperCase()} · {r.file_size_kb}KB
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">
                    {r.status}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
