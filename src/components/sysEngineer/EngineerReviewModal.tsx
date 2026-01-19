import { useEffect, useCallback } from 'react';
import { X, ClipboardList, FileCheck, TestTube, Link2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UseCaseTable } from './UseCaseTable';
import { RequirementTable } from './RequirementTable';
import { TestCaseTable } from './TestCaseTable';
import { TraceabilityMatrix } from './TraceabilityMatrix';
import { UseCase, Requirement, TestCase } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';

interface EngineerReviewModalProps {
  open: boolean;
  onClose: () => void;
  useCases: UseCase[];
  requirements: Requirement[];
  testCases: TestCase[];
  onExport: (format: 'docx' | 'pdf' | 'xlsx' | 'txt') => void;
}

export function EngineerReviewModal({
  open,
  onClose,
  useCases,
  requirements,
  testCases,
  onExport,
}: EngineerReviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const stats = {
    useCases: useCases.length,
    requirements: requirements.length,
    testCases: testCases.length,
    coverage: requirements.length > 0 
      ? Math.round((testCases.length / requirements.length) * 100) 
      : 0,
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-agent-sys-engineer/20">
            <ClipboardList className="w-5 h-5 text-agent-sys-engineer" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Engineer Review Mode</h1>
            <p className="text-sm text-muted-foreground">
              Full-screen view of generated artifacts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="gap-1.5">
              <ClipboardList className="w-3 h-3" />
              {stats.useCases} UC
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <FileCheck className="w-3 h-3" />
              {stats.requirements} Req
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <TestTube className="w-3 h-3" />
              {stats.testCases} TC
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              {stats.coverage}% Coverage
            </Badge>
          </div>

          {/* Export Dropdown */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => onExport('docx')}>
              <Download className="w-4 h-4 mr-1" />
              DOCX
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('xlsx')}>
              XLSX
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
              PDF
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 h-[calc(100vh-73px)]">
        <Tabs defaultValue="use-cases" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b border-border bg-muted/20">
            <TabsList className="bg-transparent p-0 h-auto gap-4">
              <TabsTrigger
                value="use-cases"
                className={cn(
                  "pb-3 px-1 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:shadow-none"
                )}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Use Cases
                <Badge variant="secondary" className="ml-2 text-xs">{stats.useCases}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="requirements"
                className={cn(
                  "pb-3 px-1 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:shadow-none"
                )}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Requirements
                <Badge variant="secondary" className="ml-2 text-xs">{stats.requirements}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="test-cases"
                className={cn(
                  "pb-3 px-1 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:shadow-none"
                )}
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Cases
                <Badge variant="secondary" className="ml-2 text-xs">{stats.testCases}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="traceability"
                className={cn(
                  "pb-3 px-1 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:shadow-none"
                )}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Traceability Matrix
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-6 overflow-hidden">
            <TabsContent value="use-cases" className="h-full m-0">
              <UseCaseTable
                useCases={useCases}
                onToggleSelection={() => {}}
                onSelectAll={() => {}}
              />
            </TabsContent>
            <TabsContent value="requirements" className="h-full m-0">
              <RequirementTable
                requirements={requirements}
                onToggleSelection={() => {}}
                onSelectAll={() => {}}
              />
            </TabsContent>
            <TabsContent value="test-cases" className="h-full m-0">
              <TestCaseTable testCases={testCases} />
            </TabsContent>
            <TabsContent value="traceability" className="h-full m-0">
              <TraceabilityMatrix
                useCases={useCases}
                requirements={requirements}
                testCases={testCases}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-4 right-6 text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Esc</kbd> to close
      </div>
    </div>
  );
}
