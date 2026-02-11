import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Brain,
  Target,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Mic,
  Volume2,
} from 'lucide-react';
import { ResumeResultPanel } from './resume/ResumeResultPanel';
import { ResumeListPanel } from './resume/ResumeListPanel';

type AgentState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface ResumeRecord {
  id: string;
  filename: string;
  file_type: string;
  file_size_kb: number;
  status: string;
  created_at: string;
}

export function ResumeAIWorkspace() {
  const { session } = useAuth();
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeRecord | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [reportAction, setReportAction] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

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
          headers: { Authorization: `Bearer ${session.access_token}` },
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
      toast.success(`Resume "${data.filename}" uploaded`);
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

  // Handle JD file upload — extract text and set as jobDescription
  const handleJDFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (jdFileInputRef.current) jdFileInputRef.current.value = '';

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setJobDescription(text);
        toast.success('Job description loaded');
      } else {
        // For PDF/DOCX, read raw text (basic extraction)
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(buffer).replace(/[^\x20-\x7E\n\r\t]/g, ' ').substring(0, 6000);
        setJobDescription(rawText);
        toast.success('Job description loaded (text extracted)');
      }
    } catch {
      toast.error('Failed to read job description file');
    }
  };

  // Analyze resume
  const handleAnalyze = useCallback(async (action: 'analyze' | 'match' | 'score') => {
    if (!selectedResume || !session?.access_token) return;
    setAgentState('processing');
    setReport(null);

    try {
      const body: Record<string, unknown> = { resume_id: selectedResume.id, action };
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
      setReport(data.report);
      setReportAction(data.action);
      setAgentState('success');
      toast.success(`Resume ${action} complete`);
      setTimeout(() => setAgentState('idle'), 2000);
    } catch (error) {
      setAgentState('error');
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
      setTimeout(() => setAgentState('idle'), 3000);
    }
  }, [selectedResume, session, jobDescription]);

  const stateConfigs: Record<AgentState, { color: string; icon: typeof Mic; label: string; pulse: boolean }> = {
    idle: { color: 'bg-muted', icon: Sparkles, label: 'Ready', pulse: false },
    uploading: { color: 'bg-amber-500', icon: Upload, label: 'Uploading...', pulse: true },
    processing: { color: 'bg-purple-500', icon: Brain, label: 'Analyzing...', pulse: true },
    success: { color: 'bg-emerald-500', icon: CheckCircle2, label: 'Complete', pulse: false },
    error: { color: 'bg-destructive', icon: AlertCircle, label: 'Error', pulse: false },
  };

  const stateConfig = stateConfigs[agentState];
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
            Upload, analyze, and match resumes with AI-powered hiring intelligence
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('gap-2 px-3 py-1.5 text-sm', stateConfig.pulse && 'animate-pulse')}
        >
          <div className={cn('w-2 h-2 rounded-full', stateConfig.color)} />
          {stateConfig.label}
        </Badge>
      </div>

      {/* Agent Orb */}
      <div className="flex justify-center py-4">
        <div className="relative">
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500',
              stateConfig.color,
              stateConfig.pulse && 'shadow-lg shadow-primary/30'
            )}
          >
            <StateIcon className="w-8 h-8 text-white" />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-amber-500" />
            </div>
            <CardTitle className="text-sm">Upload Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT up to 5MB</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg',
            !selectedResume && 'opacity-50 pointer-events-none'
          )}
          onClick={() => handleAnalyze('analyze')}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
              <Brain className="w-5 h-5 text-purple-500" />
            </div>
            <CardTitle className="text-sm">Analyze</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Extract skills, experience & education</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg',
            !selectedResume && 'opacity-50 pointer-events-none'
          )}
          onClick={() => handleAnalyze('match')}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <CardTitle className="text-sm">Match</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Compare against a job description</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg',
            !selectedResume && 'opacity-50 pointer-events-none'
          )}
          onClick={() => handleAnalyze('score')}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <CardTitle className="text-sm">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Detailed quality assessment</p>
          </CardContent>
        </Card>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileSelect} />
      <input ref={jdFileInputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.txt" onChange={handleJDFileSelect} />

      {/* Job Description Input */}
      {selectedResume && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Job Description (for matching)</CardTitle>
              <Button variant="outline" size="sm" onClick={() => jdFileInputRef.current?.click()}>
                <Upload className="w-3 h-3 mr-1" />
                Upload JD File
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here or upload a file (PDF, DOCX, TXT)..."
              className="w-full h-28 bg-transparent border border-border rounded-lg p-3 text-sm resize-none outline-none focus:border-primary transition-colors"
            />
          </CardContent>
        </Card>
      )}

      {/* Resumes List + Selected Info */}
      <ResumeListPanel
        resumes={resumes}
        selectedResume={selectedResume}
        onSelect={setSelectedResume}
      />

      {/* Analysis Report */}
      {report && (
        <ResumeResultPanel
          report={report}
          action={reportAction}
          onClose={() => setReport(null)}
        />
      )}
    </div>
  );
}
