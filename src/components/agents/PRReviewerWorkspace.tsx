import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Zap, 
  Shield, 
  Lock, 
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode,
  GitPullRequest,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Bug,
  ShieldAlert,
  Gauge,
  Paintbrush,
  Boxes,
  Brain,
  FileText,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAgentStore } from '@/stores/agentStore';
import { useConsoleStore } from '@/stores/consoleStore';
import { useSessionUsageStore } from '@/stores/sessionUsageStore';
import { usePRReviewStore } from '@/stores/prReviewStore';
import { 
  ReviewMode, 
  REVIEW_MODES, 
  PRReviewResult,
  PRComment
} from '@/types/prReview';
import { cn } from '@/lib/utils';
import { AgentMetricsPanel } from './AgentMetricsPanel';
import { PRFileUploadSection, UploadedPRFile } from './PRFileUploadSection';
import { toast } from 'sonner';
import { jsonrepair } from 'jsonrepair';

const modeIcons: Record<ReviewMode, React.ComponentType<{ className?: string }>> = {
  fast: Zap,
  standard: Shield,
  strict: Lock,
  'pre-merge': GitMerge
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  bug: Bug,
  security: ShieldAlert,
  performance: Gauge,
  style: Paintbrush,
  architecture: Boxes,
  logic: Brain,
  documentation: FileText
};

const severityColors: Record<string, string> = {
  info: 'text-console-info bg-console-info/10 border-console-info/30',
  warning: 'text-console-warning bg-console-warning/10 border-console-warning/30',
  error: 'text-destructive bg-destructive/10 border-destructive/30',
  critical: 'text-destructive bg-destructive/20 border-destructive/50'
};

const riskColors: Record<string, string> = {
  low: 'text-console-success',
  medium: 'text-console-warning',
  high: 'text-destructive',
  critical: 'text-destructive'
};

export function PRReviewerWorkspace() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPRFile[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestStartTime = useRef<number>(0);
  
  const { updateAgentStatus } = useAgentStore();
  const { addLog } = useConsoleStore();
  const { 
    initSession, 
    trackRequest, 
    trackSuccess, 
    trackError,
    setActiveSession 
  } = useSessionUsageStore();
  
  const {
    currentMode,
    currentResult,
    analytics,
    setReviewMode,
    setIsReviewing,
    setCurrentResult,
    addSession,
    updateAnalytics
  } = usePRReviewStore();

  useEffect(() => {
    initSession('reviewer');
    setActiveSession('reviewer');
    return () => setActiveSession(null);
  }, [initSession, setActiveSession]);

  const handleModeChange = (mode: ReviewMode) => {
    setReviewMode(mode);
    toast.success(`Review mode set to ${REVIEW_MODES[mode].name}`);
  };

  // File upload handlers
  const handleFilesUpload = useCallback((files: UploadedPRFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded`);
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleClearAllFiles = useCallback(() => {
    setUploadedFiles([]);
    toast.info('All files cleared');
  }, []);

  // Build review content from uploaded files
  const buildFileContent = useCallback(() => {
    if (uploadedFiles.length === 0) return '';
    
    return uploadedFiles.map(file => {
      return `--- File: ${file.path || file.name} ---\n${file.content}`;
    }).join('\n\n');
  }, [uploadedFiles]);

  const handleUseUploadedFiles = useCallback(() => {
    const content = buildFileContent();
    if (content) {
      setInput(prev => prev ? `${prev}\n\n${content}` : content);
      toast.success('File contents added to review input');
    }
  }, [buildFileContent]);

  const parseReviewResult = (content: string): PRReviewResult | null => {
    try {
      // Try direct parse
      const parsed = JSON.parse(content);
      return normalizeResult(parsed);
    } catch {
      // Try jsonrepair
      try {
        const repaired = jsonrepair(content);
        const parsed = JSON.parse(repaired);
        return normalizeResult(parsed);
      } catch {
        // Try extracting JSON from code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            return normalizeResult(parsed);
          } catch {
            return null;
          }
        }
        return null;
      }
    }
  };

  const normalizeResult = (parsed: any): PRReviewResult => {
    // Build health summary from parsed data
    const qualityScore = parsed.quality_score || parsed.qualityScore || 75;
    const comments = (parsed.comments || []).map((c: any, i: number) => ({
      id: c.id || `comment-${i}`,
      file: c.file || 'unknown',
      line: c.line || 0,
      severity: c.severity || 'info',
      category: c.category || 'logic',
      comment: c.comment || c.message || '',
      suggestion: c.suggestion,
      snippet: c.snippet,
      isBlocker: c.severity === 'critical' || c.severity === 'error'
    }));

    const securityFindings = (parsed.security_findings || parsed.securityFindings || []).map((f: any, i: number) => ({
      id: f.id || `security-${i}`,
      file: f.file || 'unknown',
      line: f.line || 0,
      type: f.type || 'unknown',
      severity: f.severity || 'medium',
      description: f.description || '',
      remediation: f.remediation || f.fix || ''
    }));

    // Determine risk level based on findings
    const criticalCount = comments.filter((c: PRComment) => c.severity === 'critical').length + 
                          securityFindings.filter((f: any) => f.severity === 'critical' || f.severity === 'high').length;
    const errorCount = comments.filter((c: PRComment) => c.severity === 'error').length;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalCount > 0) riskLevel = 'critical';
    else if (errorCount > 2) riskLevel = 'high';
    else if (errorCount > 0 || comments.length > 5) riskLevel = 'medium';

    // Determine merge readiness
    let mergeReadiness: 'ready' | 'needs-work' | 'blocked' = 'ready';
    if (criticalCount > 0) mergeReadiness = 'blocked';
    else if (errorCount > 0) mergeReadiness = 'needs-work';

    // Determine verdict
    let verdict: 'approve' | 'request-changes' | 'comment-only' = 'approve';
    if (parsed.summary?.toLowerCase().includes('request changes')) verdict = 'request-changes';
    else if (parsed.summary?.toLowerCase().includes('comment')) verdict = 'comment-only';
    else if (criticalCount > 0 || errorCount > 1) verdict = 'request-changes';

    return {
      health: {
        qualityScore,
        riskLevel,
        mergeReadiness,
        confidence: Math.min(95, qualityScore + 10),
        verdict
      },
      diffAwareness: {
        linesAdded: parsed.diff_stats?.added || 0,
        linesRemoved: parsed.diff_stats?.removed || 0,
        filesChanged: parsed.diff_stats?.files || 1,
        logicChanges: comments.filter((c: PRComment) => c.category === 'logic').length,
        formattingChanges: comments.filter((c: PRComment) => c.category === 'style').length,
        riskyDeletions: parsed.risky_deletions || [],
        behaviorAlteringRefactors: parsed.behavior_changes || []
      },
      comments,
      securityFindings,
      summary: parsed.summary || 'Review complete.',
      reviewMode: currentMode,
      timestamp: new Date().toISOString()
    };
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsReviewing(true);
    requestStartTime.current = Date.now();

    trackRequest('reviewer', requestStartTime.current);
    updateAgentStatus('reviewer', 'processing');
    addLog('info', `Starting ${REVIEW_MODES[currentMode].name} review...`, 'reviewer');

    try {
      // Build mode-specific prompt
      const modeConfig = REVIEW_MODES[currentMode];
      const modePrompt = `
REVIEW MODE: ${modeConfig.name.toUpperCase()}
FOCUS AREAS: ${modeConfig.focus.join(', ')}
${currentMode === 'fast' ? 'Skip minor issues. Only report critical bugs, security vulnerabilities, and blockers.' : ''}
${currentMode === 'strict' ? 'Apply strict standards. Check architecture patterns, naming conventions, and documentation completeness.' : ''}
${currentMode === 'pre-merge' ? 'Focus only on merge blockers: breaking changes, regressions, and critical issues.' : ''}

Analyze the following code/diff and provide a comprehensive PR review:
`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            agentId: 'reviewer',
            message: modePrompt + userMessage,
            history: []
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get review response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ') || line.trim() === '') continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullContent += content;
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      const result = parseReviewResult(fullContent);
      
      if (result) {
        setCurrentResult(result);
        addSession({
          reviewId: `review-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: currentMode,
          result,
          inputType: 'diff'
        });
        updateAnalytics(result);
        
        const responseTime = Date.now() - requestStartTime.current;
        trackSuccess('reviewer', responseTime, fullContent.length / 4);
        updateAgentStatus('reviewer', 'success');
        addLog('success', `Review complete: ${result.comments.length} comments, ${result.securityFindings.length} security findings`, 'reviewer');
        toast.success('PR Review complete');
      } else {
        throw new Error('Failed to parse review result');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackError('reviewer');
      updateAgentStatus('reviewer', 'error');
      addLog('error', `Review failed: ${errorMessage}`, 'reviewer');
      toast.error('Review failed. Please try again.');
    } finally {
      setIsLoading(false);
      setIsReviewing(false);
    }
  };

  const renderHealthSummary = (result: PRReviewResult) => {
    const { health, diffAwareness } = result;
    
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitPullRequest className="w-4 h-4" />
            PR Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quality Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quality Score</span>
              <span className={cn(
                'font-semibold',
                health.qualityScore >= 80 ? 'text-console-success' :
                health.qualityScore >= 60 ? 'text-console-warning' : 'text-destructive'
              )}>
                {health.qualityScore}/100
              </span>
            </div>
            <Progress value={health.qualityScore} className="h-2" />
          </div>

          {/* Status Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className={cn('text-lg font-bold', riskColors[health.riskLevel])}>
                {health.riskLevel.toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">Risk Level</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className={cn(
                'text-lg font-bold',
                health.mergeReadiness === 'ready' ? 'text-console-success' :
                health.mergeReadiness === 'needs-work' ? 'text-console-warning' : 'text-destructive'
              )}>
                {health.mergeReadiness === 'ready' ? <CheckCircle2 className="w-5 h-5 mx-auto" /> :
                 health.mergeReadiness === 'needs-work' ? <AlertCircle className="w-5 h-5 mx-auto" /> :
                 <XCircle className="w-5 h-5 mx-auto" />}
              </div>
              <div className="text-xs text-muted-foreground">Merge Ready</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-primary">{health.confidence}%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          </div>

          {/* Verdict */}
          <div className={cn(
            'p-3 rounded-lg border flex items-center gap-2',
            health.verdict === 'approve' ? 'bg-console-success/10 border-console-success/30 text-console-success' :
            health.verdict === 'comment-only' ? 'bg-console-info/10 border-console-info/30 text-console-info' :
            'bg-destructive/10 border-destructive/30 text-destructive'
          )}>
            {health.verdict === 'approve' ? <CheckCircle2 className="w-4 h-4" /> :
             health.verdict === 'comment-only' ? <FileText className="w-4 h-4" /> :
             <AlertTriangle className="w-4 h-4" />}
            <span className="font-medium capitalize">
              {health.verdict.replace('-', ' ')}
            </span>
          </div>

          <Separator />

          {/* Diff Awareness */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Diff Analysis</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-console-success" />
                <span className="text-console-success">+{diffAwareness.linesAdded}</span>
                <span className="text-muted-foreground">added</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3 h-3 text-destructive" />
                <span className="text-destructive">-{diffAwareness.linesRemoved}</span>
                <span className="text-muted-foreground">removed</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-3 h-3 text-muted-foreground" />
                <span>{diffAwareness.filesChanged}</span>
                <span className="text-muted-foreground">files</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3 text-primary" />
                <span>{diffAwareness.logicChanges}</span>
                <span className="text-muted-foreground">logic changes</span>
              </div>
            </div>

            {diffAwareness.riskyDeletions.length > 0 && (
              <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/30">
                <div className="text-xs font-medium text-destructive mb-1">Risky Deletions</div>
                <div className="text-xs text-muted-foreground">
                  {diffAwareness.riskyDeletions.slice(0, 3).join(', ')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComments = (comments: PRComment[]) => {
    const groupedByFile = comments.reduce((acc, comment) => {
      if (!acc[comment.file]) acc[comment.file] = [];
      acc[comment.file].push(comment);
      return acc;
    }, {} as Record<string, PRComment[]>);

    return (
      <div className="space-y-4">
        {Object.entries(groupedByFile).map(([file, fileComments]) => (
          <Card key={file} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                {file}
                <Badge variant="secondary" className="ml-auto">
                  {fileComments.length} comments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fileComments.map((comment) => {
                const CategoryIcon = categoryIcons[comment.category] || AlertCircle;
                return (
                  <div 
                    key={comment.id}
                    className={cn(
                      'p-3 rounded-lg border',
                      severityColors[comment.severity]
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <CategoryIcon className="w-4 h-4 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            L{comment.line}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {comment.category}
                          </Badge>
                          {comment.isBlocker && (
                            <Badge variant="destructive" className="text-xs">
                              Blocker
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                        {comment.suggestion && (
                          <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                            <span className="font-medium">Suggestion: </span>
                            {comment.suggestion}
                          </div>
                        )}
                        {comment.snippet && (
                          <pre className="mt-2 p-2 rounded bg-muted/50 text-xs font-mono overflow-x-auto">
                            {comment.snippet}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAnalytics = () => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-primary">{analytics.totalReviews}</div>
            <div className="text-xs text-muted-foreground">Total Reviews</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-console-warning">
              {analytics.averageIssuesPerPR.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Issues/PR</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-destructive">
              {analytics.securityIssuesFound}
            </div>
            <div className="text-xs text-muted-foreground">Security Issues</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-console-success">
              {analytics.avgQualityScore.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Quality</div>
          </div>
        </div>

        {Object.keys(analytics.repeatedViolations).length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Repeated Violations</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.repeatedViolations)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <Badge key={category} variant="secondary">
                    {category}: {count}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex gap-4 animate-fade-in">
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-12 h-12 rounded-lg bg-agent-reviewer/20 flex items-center justify-center">
            <GitPullRequest className="w-6 h-6 text-agent-reviewer" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PR Reviewer</h1>
            <p className="text-sm text-muted-foreground">
              Diff-native code review with health scoring
            </p>
          </div>
        </div>

        {/* Review Mode Selector */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Review Mode</div>
          <div className="flex gap-2">
            {(Object.keys(REVIEW_MODES) as ReviewMode[]).map((mode) => {
              const ModeIcon = modeIcons[mode];
              const config = REVIEW_MODES[mode];
              return (
                <Button
                  key={mode}
                  variant={currentMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange(mode)}
                  className="flex items-center gap-2"
                >
                  <ModeIcon className="w-3 h-3" />
                  <span>{config.name}</span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {REVIEW_MODES[currentMode].description} — Focus: {REVIEW_MODES[currentMode].focus.join(', ')}
          </p>
        </div>

        {/* Results Area */}
        <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
          {currentResult ? (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({currentResult.comments.length})
                </TabsTrigger>
                <TabsTrigger value="security">
                  Security ({currentResult.securityFindings.length})
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                {renderHealthSummary(currentResult)}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Review Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentResult.summary}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                {currentResult.comments.length > 0 ? (
                  renderComments(currentResult.comments)
                ) : (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-console-success mx-auto mb-2" />
                    <p className="text-muted-foreground">No issues found. PR looks clean!</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="security">
                {currentResult.securityFindings.length > 0 ? (
                  <div className="space-y-3">
                    {currentResult.securityFindings.map((finding) => (
                      <Card 
                        key={finding.id}
                        className={cn(
                          'border',
                          severityColors[finding.severity]
                        )}
                      >
                        <CardContent className="py-3">
                          <div className="flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="destructive" className="text-xs">
                                  {finding.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {finding.file}:{finding.line}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{finding.type}</p>
                              <p className="text-sm text-muted-foreground">{finding.description}</p>
                              {finding.remediation && (
                                <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                                  <span className="font-medium">Fix: </span>
                                  {finding.remediation}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-8 text-center">
                    <Shield className="w-12 h-12 text-console-success mx-auto mb-2" />
                    <p className="text-muted-foreground">No security issues detected</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                {renderAnalytics()}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <GitPullRequest className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Review</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Paste your code diff or file contents below. Select a review mode for 
                targeted feedback on bugs, security, architecture, or merge blockers.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t pt-4 space-y-3">
          {/* File Upload Collapsible */}
          <Collapsible open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Files
                  {uploadedFiles.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {uploadedFiles.length}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              {uploadedFiles.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleUseUploadedFiles}
                  className="text-xs"
                >
                  Add to review input
                </Button>
              )}
            </div>
            <CollapsibleContent className="mt-3">
              <PRFileUploadSection
                uploadedFiles={uploadedFiles}
                onFilesUpload={handleFilesUpload}
                onFileRemove={handleFileRemove}
                onClearAll={handleClearAllFiles}
                disabled={isLoading}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Text Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your code diff or file contents here, or upload files above..."
              className="resize-none min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Enter to submit, Shift+Enter for new line
            </div>
            <Button onClick={handleSubmit} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Panel */}
      <div className="w-80 shrink-0 hidden xl:block">
        <AgentMetricsPanel agentId="reviewer" />
      </div>
    </div>
  );
}
