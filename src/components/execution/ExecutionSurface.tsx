import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  CommandBar, 
  ExecutionStatus, 
  ExecutionState,
  CodeArtifact,
  DocumentArtifact,
  TableArtifact,
  DiffArtifact
} from '@/components/execution';
import { FullscreenCodeViewer } from '@/components/agents/FullscreenCodeViewer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUsageStore } from '@/stores/sessionUsageStore';
import { 
  Zap, 
  History, 
  Settings, 
  HelpCircle,
  Code2,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Artifact types
type ArtifactType = 'code' | 'document' | 'table' | 'diff';

interface Artifact {
  id: string;
  type: ArtifactType;
  data: any;
  timestamp: Date;
}

interface ExecutionRecord {
  id: string;
  prompt: string;
  artifacts: Artifact[];
  timestamp: Date;
  status: 'success' | 'error';
}

export function ExecutionSurface() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [currentArtifacts, setCurrentArtifacts] = useState<Artifact[]>([]);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [expandedCode, setExpandedCode] = useState<{ code: string; language: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const artifactsRef = useRef<HTMLDivElement>(null);
  
  const { initSession, trackRequest, trackSuccess, trackError, setActiveSession } = useSessionUsageStore();
  const executionStartTime = useRef<number>(0);

  useEffect(() => {
    initSession('code-writer');
    setActiveSession('code-writer');
  }, [initSession, setActiveSession]);

  // Auto-scroll to artifacts when they appear
  useEffect(() => {
    if (currentArtifacts.length > 0 && artifactsRef.current) {
      artifactsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentArtifacts]);

  // Parse response into artifacts
  const parseResponse = useCallback((content: string, intent: string): Artifact[] => {
    const artifacts: Artifact[] = [];
    
    // Extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let hasCode = false;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      hasCode = true;
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      
      artifacts.push({
        id: crypto.randomUUID(),
        type: 'code',
        data: {
          code,
          language,
          filename: detectFilename(code, language)
        },
        timestamp: new Date()
      });
    }

    // If no code blocks but intent suggests code, treat whole response as code
    if (!hasCode && (intent === 'code' || intent === 'refactor' || intent === 'debug')) {
      const cleanContent = content.replace(/^[\s\S]*?(?=(?:def |class |function |const |let |var |import |#include |package ))/m, '').trim();
      if (cleanContent) {
        artifacts.push({
          id: crypto.randomUUID(),
          type: 'code',
          data: {
            code: cleanContent,
            language: detectLanguage(cleanContent),
            filename: null
          },
          timestamp: new Date()
        });
      }
    }

    // For documentation intent
    if (intent === 'documentation' && !hasCode) {
      const sections = parseDocumentSections(content);
      if (sections.length > 0) {
        artifacts.push({
          id: crypto.randomUUID(),
          type: 'document',
          data: {
            title: 'Generated Documentation',
            sections
          },
          timestamp: new Date()
        });
      }
    }

    // For review intent, parse as diff
    if (intent === 'review') {
      const diffData = parseDiffContent(content);
      if (diffData) {
        artifacts.push({
          id: crypto.randomUUID(),
          type: 'diff',
          data: diffData,
          timestamp: new Date()
        });
      }
    }

    // For system/architecture intent, parse tables
    if (intent === 'architecture' || intent === 'analysis') {
      const tableData = parseTableContent(content);
      if (tableData) {
        artifacts.push({
          id: crypto.randomUUID(),
          type: 'table',
          data: tableData,
          timestamp: new Date()
        });
      }
    }

    // Fallback: if no artifacts, create a document
    if (artifacts.length === 0) {
      artifacts.push({
        id: crypto.randomUUID(),
        type: 'document',
        data: {
          title: 'Response',
          sections: [{ title: 'Output', content }]
        },
        timestamp: new Date()
      });
    }

    return artifacts;
  }, []);

  // Detect intent from prompt (invisible to user)
  const detectIntent = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.match(/write|create|generate|build|implement|code|program|function|class|api/)) {
      return 'code';
    }
    if (lowerPrompt.match(/refactor|improve|optimize|clean|restructure/)) {
      return 'refactor';
    }
    if (lowerPrompt.match(/fix|debug|error|bug|issue|problem/)) {
      return 'debug';
    }
    if (lowerPrompt.match(/review|pr|pull request|check|analyze code/)) {
      return 'review';
    }
    if (lowerPrompt.match(/document|docs|readme|explain|describe/)) {
      return 'documentation';
    }
    if (lowerPrompt.match(/test|unit test|test case|testing/)) {
      return 'testing';
    }
    if (lowerPrompt.match(/architecture|design|microservice|system|scale|infrastructure/)) {
      return 'architecture';
    }
    if (lowerPrompt.match(/use case|requirement|extract|analyze document/)) {
      return 'analysis';
    }
    if (lowerPrompt.match(/security|vulnerability|scan|audit/)) {
      return 'security';
    }
    
    return 'code'; // Default to code
  };

  // Map intent to agent (invisible)
  const mapIntentToAgent = (intent: string): string => {
    const mapping: Record<string, string> = {
      code: 'code-writer',
      refactor: 'refactor',
      debug: 'debug',
      review: 'reviewer',
      documentation: 'docs',
      testing: 'code-writer',
      architecture: 'microservices',
      analysis: 'sys-engineer',
      security: 'code-writer'
    };
    return mapping[intent] || 'code-writer';
  };

  const handleExecute = useCallback(async (prompt: string, files: any[]) => {
    setExecutionState('analyzing');
    setCurrentArtifacts([]);
    executionStartTime.current = Date.now();
    trackRequest('code-writer', executionStartTime.current);

    try {
      // Invisible intent detection
      await new Promise(resolve => setTimeout(resolve, 300));
      const intent = detectIntent(prompt);
      
      setExecutionState('routing');
      await new Promise(resolve => setTimeout(resolve, 200));
      const agentId = mapIntentToAgent(intent);

      setExecutionState('executing');

      // Build context from files
      const fileContext = files.length > 0 
        ? `\n\nAttached files:\n${files.map(f => `- ${f.name}`).join('\n')}`
        : '';

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            agentId,
            message: prompt + fileContext,
            history: []
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Execution failed: ${response.status}`);
      }

      setExecutionState('rendering');

      // Stream and parse response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  fullContent += data.choices[0].delta.content;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }

      // Parse into artifacts
      const artifacts = parseResponse(fullContent, intent);
      setCurrentArtifacts(artifacts);
      
      // Add to history
      const record: ExecutionRecord = {
        id: crypto.randomUUID(),
        prompt,
        artifacts,
        timestamp: new Date(),
        status: 'success'
      };
      setHistory(prev => [record, ...prev].slice(0, 50));

      setExecutionState('complete');
      const responseTime = Date.now() - executionStartTime.current;
      const tokenEstimate = Math.ceil(fullContent.length / 4);
      trackSuccess('code-writer', responseTime, tokenEstimate);

      // Reset to idle after delay
      setTimeout(() => setExecutionState('idle'), 2000);

    } catch (error) {
      console.error('Execution error:', error);
      setExecutionState('error');
      trackError('code-writer');
      toast.error('Execution failed. Please try again.');
      
      setTimeout(() => setExecutionState('idle'), 3000);
    }
  }, [parseResponse, trackRequest, trackSuccess, trackError]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Header - Minimal */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI IDE Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col">
        {/* Command Area - Centered when no artifacts */}
        <div className={cn(
          'flex-1 flex flex-col transition-all duration-500',
          currentArtifacts.length === 0 
            ? 'justify-center items-center px-6 py-12' 
            : 'px-6 pt-8'
        )}>
          {/* Hero Text - Only when empty */}
          {currentArtifacts.length === 0 && executionState === 'idle' && (
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold tracking-tight mb-3">
                Execute Engineering Commands
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Enter a prompt to generate code, documentation, reviews, or system designs.
                The engine handles routing and execution automatically.
              </p>
            </div>
          )}

          {/* Command Bar */}
          <CommandBar 
            onExecute={handleExecute}
            isProcessing={executionState !== 'idle' && executionState !== 'complete' && executionState !== 'error'}
          />

          {/* Execution Status */}
          <div className="flex justify-center mt-4 h-6">
            <ExecutionStatus state={executionState} />
          </div>
        </div>

        {/* Artifacts Area */}
        {currentArtifacts.length > 0 && (
          <div ref={artifactsRef} className="px-6 pb-8 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  {currentArtifacts.length} artifact{currentArtifacts.length > 1 ? 's' : ''} generated
                </Badge>
              </div>

              {currentArtifacts.map((artifact) => {
                switch (artifact.type) {
                  case 'code':
                    return (
                      <CodeArtifact
                        key={artifact.id}
                        code={artifact.data.code}
                        language={artifact.data.language}
                        filename={artifact.data.filename}
                        onExpand={() => setExpandedCode({
                          code: artifact.data.code,
                          language: artifact.data.language
                        })}
                      />
                    );
                  case 'document':
                    return (
                      <DocumentArtifact
                        key={artifact.id}
                        title={artifact.data.title}
                        sections={artifact.data.sections}
                      />
                    );
                  case 'table':
                    return (
                      <TableArtifact
                        key={artifact.id}
                        title={artifact.data.title}
                        columns={artifact.data.columns}
                        rows={artifact.data.rows}
                      />
                    );
                  case 'diff':
                    return (
                      <DiffArtifact
                        key={artifact.id}
                        title={artifact.data.title}
                        filename={artifact.data.filename}
                        lines={artifact.data.lines}
                        stats={artifact.data.stats}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        )}
      </main>

      {/* History Panel */}
      {showHistory && (
        <div className="fixed right-0 top-14 bottom-0 w-80 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 animate-slide-in-right">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Execution History</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowHistory(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-57px)]">
            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No execution history yet
                </p>
              ) : (
                history.map((record) => (
                  <button
                    key={record.id}
                    className="w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 text-left transition-colors"
                    onClick={() => {
                      setCurrentArtifacts(record.artifacts);
                      setShowHistory(false);
                    }}
                  >
                    <p className="text-sm font-mono line-clamp-2 mb-2">
                      {record.prompt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {record.artifacts.length} artifact{record.artifacts.length > 1 ? 's' : ''}
                      </Badge>
                      <span>{record.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Fullscreen Code Viewer */}
      <FullscreenCodeViewer
        isOpen={!!expandedCode}
        onClose={() => setExpandedCode(null)}
        code={expandedCode?.code || ''}
        language={expandedCode?.language || 'plaintext'}
      />
    </div>
  );
}

// Helper functions
function detectFilename(code: string, language: string): string | null {
  // Try to detect filename from common patterns
  const patterns = [
    /(?:file|filename|path):\s*['"]?([^\s'"]+)/i,
    /^#\s*(\w+\.\w+)/m,
    /^\/\/\s*(\w+\.\w+)/m,
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function detectLanguage(code: string): string {
  if (code.match(/^def |^class .+:|^import /m)) return 'python';
  if (code.match(/^function |^const |^let |^var |=>/)) return 'javascript';
  if (code.match(/^interface |^type |: \w+[[\]<>]* =/)) return 'typescript';
  if (code.match(/^public class |^private |^void /)) return 'java';
  if (code.match(/^#include |^int main\(/)) return 'cpp';
  if (code.match(/^package |^func /)) return 'go';
  if (code.match(/^fn |^impl |^struct |^enum /)) return 'rust';
  return 'plaintext';
}

function parseDocumentSections(content: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const parts = content.split(/^##\s+/m);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    const lines = part.split('\n');
    const title = lines[0].trim();
    const sectionContent = lines.slice(1).join('\n').trim();
    if (title && sectionContent) {
      sections.push({ title, content: sectionContent });
    }
  }
  
  if (sections.length === 0) {
    sections.push({ title: 'Overview', content });
  }
  
  return sections;
}

function parseDiffContent(content: string): any {
  // Simple diff parser
  const lines = content.split('\n');
  const diffLines: any[] = [];
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      diffLines.push({ type: 'added', content: line.slice(1) });
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      diffLines.push({ type: 'removed', content: line.slice(1) });
      deletions++;
    } else if (line.startsWith('@@')) {
      diffLines.push({ type: 'info', content: line });
    } else {
      diffLines.push({ type: 'context', content: line });
    }
  }

  if (diffLines.length === 0) return null;

  return {
    title: 'Code Review',
    filename: 'review.diff',
    lines: diffLines,
    stats: {
      additions,
      deletions,
      logicChanges: Math.floor((additions + deletions) / 2),
      securityIssues: 0
    }
  };
}

function parseTableContent(content: string): any {
  // Try to parse markdown tables or structured data
  const tableMatch = content.match(/\|(.+)\|[\s\S]*?\|[-:| ]+\|([\s\S]*?)(?=\n\n|\n$|$)/);
  
  if (!tableMatch) return null;

  const headerLine = tableMatch[1];
  const columns = headerLine.split('|').map(c => c.trim()).filter(Boolean);
  
  const bodyLines = tableMatch[2].split('\n').filter(l => l.includes('|'));
  const rows = bodyLines.map(line => {
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    const row: Record<string, string> = {};
    columns.forEach((col, i) => {
      row[col] = cells[i] || '';
    });
    return row;
  });

  if (rows.length === 0) return null;

  return {
    title: 'Generated Data',
    columns,
    rows
  };
}
