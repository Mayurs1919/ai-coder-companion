import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Maximize2, 
  Download,
  ChevronDown,
  ChevronUp,
  Boxes,
  Layers,
  Server,
  GitBranch,
  Gauge,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentStore } from '@/stores/agentStore';
import { useConsoleStore } from '@/stores/consoleStore';
import { useSessionUsageStore } from '@/stores/sessionUsageStore';
import { AgentId } from '@/types/agents';
import { cn } from '@/lib/utils';
import { ArchitectReviewModal } from './ArchitectReviewModal';
import { AgentMetricsPanel } from './AgentMetricsPanel';

interface ContextConfig {
  applicationType: string;
  expectedTraffic: string;
  teamSize: string;
  deploymentTarget: string;
}

interface ArchitectureSection {
  title: string;
  icon: React.ReactNode;
  content: string;
}

const AGENT_ID: AgentId = 'microservices';

export function MicroservicesWorkspace() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; sections: ArchitectureSection[] }>({ 
    open: false, 
    sections: [] 
  });
  const [lastPrompt, setLastPrompt] = useState('');
  const [contextConfig, setContextConfig] = useState<ContextConfig>({
    applicationType: '',
    expectedTraffic: '',
    teamSize: '',
    deploymentTarget: '',
  });
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
    setActiveSession 
  } = useSessionUsageStore();
  
  const agent = getAgent(AGENT_ID);
  const agentMessages = messages[AGENT_ID] || [];
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    initSession(AGENT_ID);
    setActiveSession(AGENT_ID);
    return () => setActiveSession(null);
  }, [initSession, setActiveSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentMessages]);

  // Auto-open architect review mode when generation completes
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const isNowNotLoading = !isLoading;
    
    if (wasLoading && isNowNotLoading && agentMessages.length > 0) {
      const lastMessage = agentMessages[agentMessages.length - 1];
      
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const sections = parseArchitectureSections(lastMessage.content);
        if (sections.length > 0) {
          setReviewModal({ open: true, sections });
        }
      }
    }
    
    prevLoadingRef.current = isLoading;
  }, [isLoading, agentMessages]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  const buildContextPrefix = (): string => {
    const parts: string[] = [];
    if (contextConfig.applicationType) {
      parts.push(`Application Type: ${contextConfig.applicationType}`);
    }
    if (contextConfig.expectedTraffic) {
      parts.push(`Expected Traffic: ${contextConfig.expectedTraffic}`);
    }
    if (contextConfig.teamSize) {
      parts.push(`Team Size: ${contextConfig.teamSize}`);
    }
    if (contextConfig.deploymentTarget) {
      parts.push(`Deployment Target: ${contextConfig.deploymentTarget}`);
    }
    return parts.length > 0 ? `Context:\n${parts.join('\n')}\n\nRequirement:\n` : '';
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const contextPrefix = buildContextPrefix();
    const userMessage = contextPrefix + input.trim();
    
    if (input.trim() === lastPrompt && lastPrompt !== '') {
      trackRetry(AGENT_ID);
    }
    setLastPrompt(input.trim());
    
    setInput('');
    setIsLoading(true);
    requestStartTime.current = Date.now();

    trackRequest(AGENT_ID, requestStartTime.current);

    addMessage(AGENT_ID, {
      agentId: AGENT_ID,
      role: 'user',
      content: userMessage,
    });

    updateAgentStatus(AGENT_ID, 'processing');
    addLog('info', `Processing architecture request...`, AGENT_ID);

    try {
      addMessage(AGENT_ID, {
        agentId: AGENT_ID,
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
            agentId: AGENT_ID,
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
                tokenEstimate += content.length / 4;
                updateLastMessage(AGENT_ID, assistantContent);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      const responseTime = Date.now() - requestStartTime.current;
      trackSuccess(AGENT_ID, responseTime, Math.round(tokenEstimate));
      
      updateAgentStatus(AGENT_ID, 'success');
      addLog('success', `Architecture design completed`, AGENT_ID);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackError(AGENT_ID);
      updateAgentStatus(AGENT_ID, 'error');
      addLog('error', `Architecture design failed: ${errorMessage}`, AGENT_ID);
      
      updateLastMessage(AGENT_ID, `Error: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySection = async (content: string, sectionTitle: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSection(sectionTitle);
    trackCopy(AGENT_ID);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExpand = (sections: ArchitectureSection[]) => {
    setReviewModal({ open: true, sections });
    trackExpand(AGENT_ID);
  };

  const handleDownloadArchitecture = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-design.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackDownload(AGENT_ID);
  };

  const parseArchitectureSections = (content: string): ArchitectureSection[] => {
    const sections: ArchitectureSection[] = [];
    
    // Parse markdown headers as sections
    const sectionPatterns = [
      { pattern: /##\s*Overview\s*\n([\s\S]*?)(?=##|$)/i, title: 'Overview', icon: <Layers className="w-4 h-4" /> },
      { pattern: /##\s*Services?\s*\n([\s\S]*?)(?=##|$)/i, title: 'Services', icon: <Server className="w-4 h-4" /> },
      { pattern: /##\s*Infrastructure\s*\n([\s\S]*?)(?=##|$)/i, title: 'Infrastructure', icon: <Boxes className="w-4 h-4" /> },
      { pattern: /##\s*Communication\s*(?:Patterns?)?\s*\n([\s\S]*?)(?=##|$)/i, title: 'Communication Patterns', icon: <GitBranch className="w-4 h-4" /> },
      { pattern: /##\s*Scalability\s*(?:Notes?)?\s*\n([\s\S]*?)(?=##|$)/i, title: 'Scalability Notes', icon: <Gauge className="w-4 h-4" /> },
    ];

    for (const { pattern, title, icon } of sectionPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim()) {
        sections.push({ title, icon, content: match[1].trim() });
      }
    }

    // If no structured sections found, create a single overview section
    if (sections.length === 0 && content.trim()) {
      sections.push({ 
        title: 'Architecture Design', 
        icon: <Boxes className="w-4 h-4" />, 
        content: content.trim() 
      });
    }

    return sections;
  };

  const renderArchitectureOutput = (content: string, messageIndex: number) => {
    const sections = parseArchitectureSections(content);
    
    if (sections.length === 0) {
      return <p className="whitespace-pre-wrap text-sm">{content}</p>;
    }

    return (
      <div className="space-y-4">
        {/* Action Bar */}
        <div className="flex items-center justify-end gap-2 pb-2 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleDownloadArchitecture(content)}
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleExpand(sections)}
          >
            <Maximize2 className="w-3 h-3 mr-1" />
            Full Review
          </Button>
        </div>

        {/* Structured Sections */}
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{section.icon}</span>
                <span className="text-sm font-medium">{section.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => handleCopySection(section.content, section.title)}
              >
                {copiedSection === section.title ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="p-4">
              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {section.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex gap-4 animate-fade-in">
      {/* Main Workspace Area */}
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
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-agent-microservices/20">
            <Boxes className="w-6 h-6 text-agent-microservices" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Microservices Architecture</h1>
            <p className="text-sm text-muted-foreground">System design workspace for scalable architectures</p>
          </div>
          <Badge
            variant={agent.status === 'processing' ? 'default' : 'secondary'}
            className={cn(
              'ml-auto',
              agent.status === 'processing' && 'animate-pulse'
            )}
          >
            {agent.status === 'processing' ? 'Designing...' : 'Ready'}
          </Badge>
        </div>

        {/* Workspace Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Architecture Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {agentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Boxes className="w-16 h-16 mb-6 text-agent-microservices/30" />
                  <h3 className="text-lg font-semibold mb-2">Define your system requirements</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-6">
                    Describe product type, scale expectations, constraints, and team size.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-xs">SaaS Platforms</Badge>
                    <Badge variant="outline" className="text-xs">E-commerce</Badge>
                    <Badge variant="outline" className="text-xs">FinTech</Badge>
                    <Badge variant="outline" className="text-xs">API Platforms</Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {agentMessages.map((message, index) => (
                    <div key={message.id} className="space-y-2">
                      {message.role === 'user' ? (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary shrink-0">
                            <span className="text-xs font-medium text-primary-foreground">You</span>
                          </div>
                          <div className="flex-1 rounded-lg p-4 bg-primary/10 border border-primary/20">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Boxes className="w-4 h-4 text-agent-microservices" />
                            <span className="text-xs font-medium uppercase tracking-wide">Architecture Design</span>
                          </div>
                          <div className="rounded-lg bg-card border border-border/50 p-4">
                            {isLoading && !message.content ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Analyzing requirements...</span>
                              </div>
                            ) : (
                              renderArchitectureOutput(message.content, index)
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {/* Context Builder + Input Area */}
            <div className="border-t">
              {/* Collapsible Context Builder */}
              <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Context Builder
                      <Badge variant="secondary" className="text-[10px] px-1.5">Optional</Badge>
                    </span>
                    {contextOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Application Type</label>
                      <Select 
                        value={contextConfig.applicationType} 
                        onValueChange={(v) => setContextConfig(prev => ({ ...prev, applicationType: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SaaS">SaaS</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="FinTech">FinTech</SelectItem>
                          <SelectItem value="API Platform">API Platform</SelectItem>
                          <SelectItem value="Internal Tool">Internal Tool</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Expected Traffic</label>
                      <Select 
                        value={contextConfig.expectedTraffic} 
                        onValueChange={(v) => setContextConfig(prev => ({ ...prev, expectedTraffic: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select traffic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Team Size</label>
                      <Select 
                        value={contextConfig.teamSize} 
                        onValueChange={(v) => setContextConfig(prev => ({ ...prev, teamSize: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Small (2-5)">Small (2-5)</SelectItem>
                          <SelectItem value="Medium (6-15)">Medium (6-15)</SelectItem>
                          <SelectItem value="Large (15+)">Large (15+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Deployment Target</label>
                      <Select 
                        value={contextConfig.deploymentTarget} 
                        onValueChange={(v) => setContextConfig(prev => ({ ...prev, deploymentTarget: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AWS">AWS</SelectItem>
                          <SelectItem value="GCP">GCP</SelectItem>
                          <SelectItem value="Azure">Azure</SelectItem>
                          <SelectItem value="On-prem">On-prem</SelectItem>
                          <SelectItem value="Undecided">Undecided</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Input */}
              <div className="p-4 pt-2">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Design a scalable backend for a SaaS platform expecting 100k users with authentication, billing, and reporting modules."
                    className="min-h-[80px] resize-none text-sm"
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
                  Press Enter to submit • Shift+Enter for new line
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Panel */}
      <div className="w-72 shrink-0 hidden lg:block">
        <AgentMetricsPanel agentId={AGENT_ID} />
      </div>

      <ArchitectReviewModal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, sections: [] })}
        sections={reviewModal.sections}
      />
    </div>
  );
}
