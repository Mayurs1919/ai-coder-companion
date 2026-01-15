import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, Copy, Check, ArrowLeft, Maximize2, Download } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentStore } from '@/stores/agentStore';
import { useConsoleStore } from '@/stores/consoleStore';
import { useSessionUsageStore } from '@/stores/sessionUsageStore';
import { AGENTS, AgentId } from '@/types/agents';
import { cn } from '@/lib/utils';
import { FullscreenCodeViewer } from './FullscreenCodeViewer';
import { AgentMetricsPanel } from './AgentMetricsPanel';
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

export function AgentWorkspace() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [fullscreenCode, setFullscreenCode] = useState<{ code: string; language: string } | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestStartTime = useRef<number>(0);
  
  const { messages, addMessage, updateLastMessage, updateAgentStatus, getAgent } = useAgentStore();
  const { addLog } = useConsoleStore();
  const { 
    initSession, 
    trackRequest, 
    trackSuccess, 
    trackError, 
    trackRetry,
    trackCopy, 
    trackExpand, 
    trackDownload,
    trackLanguage,
    setActiveSession 
  } = useSessionUsageStore();
  
  const agent = getAgent(agentId as AgentId);
  const agentMessages = messages[agentId as AgentId] || [];
  const prevMessagesLengthRef = useRef(agentMessages.length);
  const prevLoadingRef = useRef(isLoading);

  // Initialize session on mount
  useEffect(() => {
    if (agentId) {
      initSession(agentId as AgentId);
      setActiveSession(agentId as AgentId);
    }
    return () => setActiveSession(null);
  }, [agentId, initSession, setActiveSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentMessages]);

  // Auto-open fullscreen code viewer when code generation completes
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const isNowNotLoading = !isLoading;
    
    if (wasLoading && isNowNotLoading && agentMessages.length > 0) {
      const lastMessage = agentMessages[agentMessages.length - 1];
      
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const codeBlocks = extractCodeBlocks(lastMessage.content);
        if (codeBlocks.length > 0) {
          setFullscreenCode({
            code: codeBlocks[0].code,
            language: codeBlocks[0].language,
          });
          // Track languages used
          codeBlocks.forEach(block => {
            trackLanguage(agentId as AgentId, block.language);
          });
        }
      }
    }
    
    prevMessagesLengthRef.current = agentMessages.length;
    prevLoadingRef.current = isLoading;
  }, [isLoading, agentMessages, agentId, trackLanguage]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  const Icon = iconMap[agent.icon] || Code2;

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // Check if this is a retry (same prompt as last time)
    if (userMessage === lastPrompt && lastPrompt !== '') {
      trackRetry(agentId as AgentId);
    }
    setLastPrompt(userMessage);
    
    setInput('');
    setIsLoading(true);
    requestStartTime.current = Date.now();

    // Track the request
    trackRequest(agentId as AgentId, requestStartTime.current);

    addMessage(agentId as AgentId, {
      agentId: agentId as AgentId,
      role: 'user',
      content: userMessage,
    });

    updateAgentStatus(agentId as AgentId, 'processing');
    addLog('info', `Processing request with ${agent.name}...`, agentId as AgentId);

    try {
      addMessage(agentId as AgentId, {
        agentId: agentId as AgentId,
        role: 'assistant',
        content: '',
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            agentId,
            message: userMessage,
            history: agentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add more credits.');
        }
        throw new Error('Failed to get response from AI');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let tokenEstimate = 0;

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
              if (content) {
                assistantContent += content;
                tokenEstimate += content.length / 4; // Rough token estimate
                updateLastMessage(agentId as AgentId, assistantContent);
              }
            } catch {
              // Ignore parse errors from incomplete chunks
            }
          }
        }
      }

      const responseTime = Date.now() - requestStartTime.current;
      trackSuccess(agentId as AgentId, responseTime, Math.round(tokenEstimate));
      
      updateAgentStatus(agentId as AgentId, 'success');
      addLog('success', `${agent.name} completed task`, agentId as AgentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackError(agentId as AgentId);
      updateAgentStatus(agentId as AgentId, 'error');
      addLog('error', `${agent.name} failed: ${errorMessage}`, agentId as AgentId);
      
      updateLastMessage(
        agentId as AgentId,
        `Error: ${errorMessage}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    trackCopy(agentId as AgentId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExpand = (code: string, language: string) => {
    setFullscreenCode({ code, language });
    trackExpand(agentId as AgentId);
  };

  const handleDownload = (code: string, language: string) => {
    const extension = getFileExtension(language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackDownload(agentId as AgentId);
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      bash: 'sh',
    };
    return extensions[language.toLowerCase()] || 'txt';
  };

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
      });
    }

    return blocks;
  };

  const renderMessageContent = (content: string, messageIndex: number) => {
    const codeBlocks = extractCodeBlocks(content);
    
    if (codeBlocks.length === 0) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    let remainingContent = content;
    const parts: React.ReactNode[] = [];

    codeBlocks.forEach((block, blockIndex) => {
      const blockPattern = `\`\`\`${block.language}\n${block.code}\n\`\`\``;
      const altBlockPattern = `\`\`\`\n${block.code}\n\`\`\``;
      
      const splitIndex = remainingContent.indexOf(blockPattern);
      const altSplitIndex = remainingContent.indexOf(altBlockPattern);
      const actualSplitIndex = splitIndex !== -1 ? splitIndex : altSplitIndex;
      const actualPattern = splitIndex !== -1 ? blockPattern : altBlockPattern;

      if (actualSplitIndex > 0) {
        parts.push(
          <p key={`text-${blockIndex}`} className="whitespace-pre-wrap mb-4">
            {remainingContent.slice(0, actualSplitIndex).trim()}
          </p>
        );
      }

      parts.push(
        <div key={`code-${blockIndex}`} className="my-4 rounded-lg overflow-hidden border border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
            <Badge variant="secondary" className="text-xs font-mono">
              {block.language}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => handleCopy(block.code, messageIndex * 100 + blockIndex)}
              >
                {copiedIndex === messageIndex * 100 + blockIndex ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => handleDownload(block.code, block.language)}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => handleExpand(block.code, block.language)}
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Expand
              </Button>
            </div>
          </div>
          <Editor
            height="200px"
            language={block.language}
            value={block.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
              folding: false,
              wordWrap: 'on',
            }}
          />
        </div>
      );

      remainingContent = remainingContent.slice(
        actualSplitIndex + actualPattern.length
      );
    });

    if (remainingContent.trim()) {
      parts.push(
        <p key="text-end" className="whitespace-pre-wrap mt-4">
          {remainingContent.trim()}
        </p>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div className="h-full flex gap-4 animate-fade-in">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              `bg-${agent.color}/20`
            )}
          >
            <Icon className={cn('w-6 h-6', `text-${agent.color}`)} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
          <Badge
            variant={agent.status === 'processing' ? 'default' : 'secondary'}
            className={cn(
              'ml-auto',
              agent.status === 'processing' && 'animate-pulse'
            )}
          >
            {agent.status === 'processing' ? 'Processing...' : 'Ready'}
          </Badge>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 min-h-0">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              {agentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Icon className={cn('w-12 h-12 mb-4', `text-${agent.color}/50`)} />
                  <h3 className="font-medium mb-2">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Describe what you need and the {agent.name} will help you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentMessages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                          message.role === 'user'
                            ? 'bg-primary'
                            : `bg-${agent.color}/20`
                        )}
                      >
                        {message.role === 'user' ? (
                          <span className="text-xs font-medium text-primary-foreground">
                            You
                          </span>
                        ) : (
                          <Icon className={cn('w-4 h-4', `text-${agent.color}`)} />
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex-1 rounded-lg p-4',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.role === 'assistant' && isLoading && !message.content ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        ) : (
                          renderMessageContent(message.content, index)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask the ${agent.name} something...`}
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="h-auto px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>

      {/* Metrics Panel */}
      <div className="w-72 shrink-0 hidden lg:block">
        <AgentMetricsPanel agentId={agentId as AgentId} />
      </div>

      <FullscreenCodeViewer
        isOpen={fullscreenCode !== null}
        onClose={() => setFullscreenCode(null)}
        code={fullscreenCode?.code || ''}
        language={fullscreenCode?.language || 'plaintext'}
      />
    </div>
  );
}
