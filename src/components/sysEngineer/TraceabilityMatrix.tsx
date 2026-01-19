import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Link2, FileCheck, ClipboardList, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UseCase, Requirement, TestCase, TraceabilityItem } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';

interface TraceabilityMatrixProps {
  useCases: UseCase[];
  requirements: Requirement[];
  testCases: TestCase[];
  onHighlight?: (ucId: string | null, reqId: string | null) => void;
}

export function TraceabilityMatrix({ useCases, requirements, testCases, onHighlight }: TraceabilityMatrixProps) {
  const [expandedUCs, setExpandedUCs] = useState<Set<string>>(new Set());
  const [expandedReqs, setExpandedReqs] = useState<Set<string>>(new Set());
  const [highlightedUC, setHighlightedUC] = useState<string | null>(null);
  const [highlightedReq, setHighlightedReq] = useState<string | null>(null);

  const traceabilityData = useMemo<TraceabilityItem[]>(() => {
    return useCases.map((uc) => {
      const ucReqs = requirements.filter((r) => r.useCaseId === uc.useCaseId);
      return {
        useCaseId: uc.useCaseId,
        useCaseName: uc.useCaseName,
        requirements: ucReqs.map((req) => ({
          requirementId: req.requirementId,
          requirementTitle: req.requirementTitle,
          testCases: testCases
            .filter((tc) => tc.useCaseId === uc.useCaseId && tc.requirementId === req.requirementId)
            .map((tc) => ({
              testCaseId: tc.testCaseId,
              testCaseName: tc.testCaseName,
            })),
        })),
      };
    });
  }, [useCases, requirements, testCases]);

  const toggleUC = (ucId: string) => {
    setExpandedUCs((prev) => {
      const next = new Set(prev);
      if (next.has(ucId)) {
        next.delete(ucId);
      } else {
        next.add(ucId);
      }
      return next;
    });
  };

  const toggleReq = (key: string) => {
    setExpandedReqs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleUCClick = (ucId: string) => {
    const newHighlight = highlightedUC === ucId ? null : ucId;
    setHighlightedUC(newHighlight);
    setHighlightedReq(null);
    onHighlight?.(newHighlight, null);
  };

  const handleReqClick = (ucId: string, reqId: string) => {
    const newHighlight = highlightedReq === reqId ? null : reqId;
    setHighlightedReq(newHighlight);
    setHighlightedUC(ucId);
    onHighlight?.(ucId, newHighlight);
  };

  const getStatusIndicator = (count: number) => {
    if (count === 0) return 'bg-destructive/50';
    if (count < 3) return 'bg-console-warning/50';
    return 'bg-console-success/50';
  };

  if (traceabilityData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Link2 className="w-12 h-12 mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">No traceability data available</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Generate use cases, requirements, and test cases to view the matrix
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2 p-1">
        {traceabilityData.map((item) => (
          <Card 
            key={item.useCaseId}
            className={cn(
              "transition-colors border-border/50",
              highlightedUC === item.useCaseId && "border-primary/50 bg-primary/5"
            )}
          >
            <CardContent className="p-0">
              {/* Use Case Level */}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors",
                  expandedUCs.has(item.useCaseId) && "border-b border-border/30"
                )}
                onClick={() => toggleUC(item.useCaseId)}
              >
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  {expandedUCs.has(item.useCaseId) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-agent-sys-engineer/20 shrink-0">
                  <ClipboardList className="w-4 h-4 text-agent-sys-engineer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{item.useCaseId}</span>
                    <span className="font-medium truncate">{item.useCaseName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.requirements.length} Req
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.requirements.reduce((acc, r) => acc + r.testCases.length, 0)} TC
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUCClick(item.useCaseId);
                  }}
                >
                  <Link2 className="w-3 h-3 mr-1" />
                  Trace
                </Button>
              </div>

              {/* Requirements Level */}
              {expandedUCs.has(item.useCaseId) && (
                <div className="pl-10">
                  {item.requirements.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No requirements linked
                    </div>
                  ) : (
                    item.requirements.map((req) => {
                      const reqKey = `${item.useCaseId}-${req.requirementId}`;
                      return (
                        <div key={req.requirementId}>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/20 transition-colors border-b border-border/20",
                              highlightedReq === req.requirementId && "bg-primary/10"
                            )}
                            onClick={() => toggleReq(reqKey)}
                          >
                            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
                              {expandedReqs.has(reqKey) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/20 shrink-0">
                              <FileCheck className="w-3 h-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">{req.requirementId}</span>
                                <span className="text-sm truncate">{req.requirementTitle}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", getStatusIndicator(req.testCases.length))} />
                              <Badge variant="secondary" className="text-xs">
                                {req.testCases.length} TC
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReqClick(item.useCaseId, req.requirementId);
                              }}
                            >
                              <Link2 className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Test Cases Level */}
                          {expandedReqs.has(reqKey) && (
                            <div className="pl-10 py-2 bg-muted/10">
                              {req.testCases.length === 0 ? (
                                <div className="py-2 text-center text-xs text-muted-foreground">
                                  No test cases linked
                                </div>
                              ) : (
                                req.testCases.map((tc) => (
                                  <div
                                    key={tc.testCaseId}
                                    className="flex items-center gap-3 px-4 py-1.5"
                                  >
                                    <div className="w-5 h-5 rounded flex items-center justify-center bg-console-success/20 shrink-0">
                                      <TestTube className="w-3 h-3 text-console-success" />
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground">{tc.testCaseId}</span>
                                    <span className="text-xs truncate">{tc.testCaseName}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
