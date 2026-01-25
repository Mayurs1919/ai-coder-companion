import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Rocket, 
  Send, 
  Paperclip, 
  X, 
  FileCode, 
  FileText,
  ChevronUp,
  Sparkles,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AttachedFile {
  id: string;
  name: string;
  type: 'code' | 'doc' | 'spec';
  size: number;
}

interface CommandBarProps {
  onExecute: (prompt: string, files: AttachedFile[]) => void;
  isProcessing: boolean;
  placeholder?: string;
}

const EXAMPLE_PROMPTS = [
  "Write a Python Fibonacci program",
  "Generate test cases for API v2 authentication",
  "Review PR #245 for risky deletions",
  "Extract use cases from this document",
  "Design a scalable microservices architecture",
  "Refactor this code for better performance",
  "Generate API documentation for this endpoint",
  "Analyze security vulnerabilities in this code"
];

export function CommandBar({ onExecute, isProcessing, placeholder }: CommandBarProps) {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter to execute, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isProcessing) {
        onExecute(input.trim(), attachedFiles);
        setInput('');
        setAttachedFiles([]);
        setShowSuggestions(false);
      }
    }
  }, [input, attachedFiles, isProcessing, onExecute]);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.name.match(/\.(py|js|ts|tsx|jsx|java|c|cpp|go|rs|rb)$/i) ? 'code' 
        : file.name.match(/\.(md|txt|doc|docx)$/i) ? 'doc' : 'spec',
      size: file.size
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'code': return FileCode;
      case 'doc': return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Command Bar Container */}
      <div
        className={cn(
          'relative rounded-2xl border-2 transition-all duration-300',
          'bg-card/80 backdrop-blur-xl',
          isFocused 
            ? 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
            : 'border-border/50 hover:border-border',
          isProcessing && 'opacity-80 pointer-events-none'
        )}
      >
        {/* Glow Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 pointer-events-none" />
        )}

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0 relative z-10">
            {attachedFiles.map(file => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-3 p-4 relative z-10">
          {/* Rocket Icon */}
          <div className="flex-shrink-0 pb-1">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
              isFocused 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                : 'bg-muted text-muted-foreground'
            )}>
              <Rocket className="w-5 h-5" />
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                if (!input) setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                // Delay hiding suggestions to allow click
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder || "Enter an engineering command..."}
              className={cn(
                'w-full bg-transparent resize-none outline-none',
                'text-foreground placeholder:text-muted-foreground/60',
                'min-h-[24px] max-h-[200px] py-2',
                'font-mono text-sm leading-relaxed'
              )}
              rows={1}
              disabled={isProcessing}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-1">
            {/* Attach */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileAttach}
              accept=".py,.js,.ts,.tsx,.jsx,.java,.c,.cpp,.go,.rs,.rb,.md,.txt,.doc,.docx,.pdf,.json,.yaml,.yml"
            />

            {/* Execute */}
            <Button
              size="sm"
              className={cn(
                'h-9 px-4 gap-2 rounded-xl font-medium transition-all',
                input.trim() 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'bg-muted text-muted-foreground'
              )}
              onClick={() => {
                if (input.trim() && !isProcessing) {
                  onExecute(input.trim(), attachedFiles);
                  setInput('');
                  setAttachedFiles([]);
                  setShowSuggestions(false);
                }
              }}
              disabled={!input.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Keyboard Hint */}
        <div className="absolute bottom-1 right-4 flex items-center gap-3 text-[10px] text-muted-foreground/50 pointer-events-none">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono">↵</kbd>
            Execute
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono">⇧↵</kbd>
            New line
          </span>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !input && (
        <div className="mt-2 p-2 rounded-xl border border-border/50 bg-card/95 backdrop-blur-lg shadow-xl">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            Example Commands
          </div>
          <div className="space-y-0.5">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(prompt)}
                className={cn(
                  'w-full px-3 py-2.5 text-left text-sm rounded-lg transition-colors',
                  'hover:bg-muted/50 text-foreground/80 hover:text-foreground',
                  'font-mono'
                )}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
