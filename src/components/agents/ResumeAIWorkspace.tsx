import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Mic,
  MicOff,
  Upload,
  FileText,
  Brain,
  Target,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Volume2,
} from 'lucide-react';

type AgentState = 'idle' | 'listening' | 'uploading' | 'processing' | 'speaking' | 'success' | 'error';

interface ResumeRecord {
  id: string;
  filename: string;
  file_type: string;
  file_size_kb: number;
  status: string;
  created_at: string;
}

interface AnalysisResult {
  action: string;
  result: Record<string, unknown>;
}

export function ResumeAIWorkspace() {
  const { session } = useAuth();
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeRecord | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload resume
  const handleUpload = useCallback(async (file: File) => {
    if (!session?.access_token) {
      toast.error('Please sign in to upload resumes');
      return;
    }

    setAgentState('uploading');
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      const newResume: ResumeRecord = {
        id: data.resume_id,
        filename: data.filename,
        file_type: data.file_type,
        file_size_kb: data.file_size_kb,
        status: data.status,
        created_at: new Date().toISOString(),
      };

      setResumes(prev => [newResume, ...prev]);
      setSelectedResume(newResume);
      setAgentState('success');
      toast.success(`Resume "${data.filename}" uploaded successfully`);

      setTimeout(() => setAgentState('idle'), 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setAgentState('error');
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setTimeout(() => setAgentState('idle'), 3000);
    }
  }, [session]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Analyze resume
  const handleAnalyze = useCallback(async (action: 'analyze' | 'match' | 'score') => {
    if (!selectedResume || !session?.access_token) return;

    setAgentState('processing');
    setAnalysisResult(null);

    try {
      const body: Record<string, unknown> = {
        resume_id: selectedResume.id,
        action,
      };
      if (action === 'match' && jobDescription) {
        body.job_description = jobDescription;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult({ action: data.action, result: data.result });
      setAgentState('success');
      toast.success(`Resume ${action} complete`);
      setTimeout(() => setAgentState('idle'), 2000);
    } catch (error) {
      setAgentState('error');
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
      setTimeout(() => setAgentState('idle'), 3000);
    }
  }, [selectedResume, session, jobDescription]);

  const getStateConfig = () => {
    const configs: Record<AgentState, { color: string; icon: typeof Mic; label: string; pulse: boolean }> = {
      idle: { color: 'bg-muted', icon: Mic, label: 'Ready', pulse: false },
      listening: { color: 'bg-blue-500', icon: Mic, label: 'Listening...', pulse: true },
      uploading: { color: 'bg-amber-500', icon: Upload, label: 'Uploading...', pulse: true },
      processing: { color: 'bg-purple-500', icon: Brain, label: 'Analyzing...', pulse: true },
      speaking: { color: 'bg-green-500', icon: Volume2, label: 'Speaking...', pulse: true },
      success: { color: 'bg-emerald-500', icon: CheckCircle2, label: 'Complete', pulse: false },
      error: { color: 'bg-destructive', icon: AlertCircle, label: 'Error', pulse: false },
    };
    return configs[agentState];
  };

  const stateConfig = getStateConfig();
  const StateIcon = stateConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Resume AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload, analyze, and match resumes with AI-powered intelligence
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'gap-2 px-3 py-1.5 text-sm',
            stateConfig.pulse && 'animate-pulse'
          )}
        >
          <div className={cn('w-2 h-2 rounded-full', stateConfig.color)} />
          {stateConfig.label}
        </Badge>
      </div>

      {/* Agent Orb - Visual State Indicator */}
      <div className="flex justify-center py-6">
        <div className="relative">
          <div
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500',
              stateConfig.color,
              stateConfig.pulse && 'shadow-lg shadow-primary/30'
            )}
          >
            <StateIcon className="w-10 h-10 text-white" />
          </div>
          {stateConfig.pulse && (
            <>
              <div className={cn('absolute inset-0 rounded-full animate-ping opacity-20', stateConfig.color)} />
              <div className={cn('absolute -inset-2 rounded-full animate-pulse opacity-10', stateConfig.color)} />
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {agentState === 'uploading' && (
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg',
            agentState === 'uploading' && 'border-amber-500/50'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6 text-amber-500" />
            </div>
            <CardTitle className="text-base">Upload Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, or TXT files up to 5MB
            </p>
          </CardContent>
        </Card>

        {/* Analyze Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg',
            !selectedResume && 'opacity-50 pointer-events-none'
          )}
          onClick={() => handleAnalyze('analyze')}
        >
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <CardTitle className="text-base">Analyze Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Extract skills, experience, and education
            </p>
          </CardContent>
        </Card>

        {/* Match Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg',
            !selectedResume && 'opacity-50 pointer-events-none'
          )}
          onClick={() => handleAnalyze('match')}
        >
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-base">Match Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Compare against a job description
            </p>
          </CardContent>
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
      />

      {/* Job Description Input (for matching) */}
      {selectedResume && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Job Description (for matching)</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here to match against the selected resume..."
              className="w-full h-24 bg-transparent border border-border rounded-lg p-3 text-sm resize-none outline-none focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>
      )}

      {/* Selected Resume & Uploaded Resumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Uploaded Resumes */}
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
                      onClick={() => setSelectedResume(r)}
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

        {/* Score Card */}
        {selectedResume && (
          <Card
            className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
            onClick={() => handleAnalyze('score')}
          >
            <CardHeader className="pb-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle className="text-base">Score Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get a detailed quality score with category breakdowns
              </p>
              {selectedResume && (
                <p className="text-xs text-primary mt-2">
                  Selected: {selectedResume.filename}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {analysisResult.action === 'analyze'
                  ? 'Resume Analysis'
                  : analysisResult.action === 'match'
                  ? 'Match Report'
                  : 'Score Report'}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAnalysisResult(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-4">
                {JSON.stringify(analysisResult.result, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
