import { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Layers, Server, Boxes, GitBranch, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ArchitectureSection {
  title: string;
  icon: React.ReactNode;
  content: string;
}

interface ArchitectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ArchitectureSection[];
}

export function ArchitectReviewModal({
  isOpen,
  onClose,
  sections,
}: ArchitectReviewModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (sections.length > 0 && !activeTab) {
      setActiveTab(sections[0].title);
    }
  }, [sections, activeTab]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async (content: string, sectionTitle: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(sectionTitle);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadAll = () => {
    const fullContent = sections
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-design.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (sections.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 bg-background border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-agent-microservices/20">
              <Boxes className="w-5 h-5 text-agent-microservices" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Architect Review Mode</h2>
              <p className="text-xs text-muted-foreground">System design document • Press Esc to close</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleDownloadAll}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="flex-1 flex overflow-hidden">
          {sections.length > 1 ? (
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <div className="px-6 pt-4 pb-2 border-b border-border/30">
                <TabsList className="h-auto p-1 bg-muted/50">
                  {sections.map((section) => (
                    <TabsTrigger
                      key={section.title}
                      value={section.title}
                      className="flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-background"
                    >
                      {section.icon}
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {sections.map((section) => (
                <TabsContent 
                  key={section.title} 
                  value={section.title}
                  className="flex-1 m-0 overflow-hidden"
                >
                  <ScrollArea className="h-full">
                    <div className="p-6 max-w-4xl mx-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{section.icon}</span>
                          <h3 className="text-xl font-semibold">{section.title}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(section.content, section.title)}
                        >
                          {copied === section.title ? (
                            <>
                              <Check className="w-4 h-4 mr-2 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{sections[0].icon}</span>
                    <h3 className="text-xl font-semibold">{sections[0].title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(sections[0].content, sections[0].title)}
                  >
                    {copied === sections[0].title ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base">
                    {sections[0].content}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
