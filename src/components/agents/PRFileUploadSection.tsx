import { useState, useCallback } from 'react';
import { Upload, File, X, FileCode, FileText, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface UploadedPRFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: Date;
}

interface PRFileUploadSectionProps {
  uploadedFiles: UploadedPRFile[];
  onFilesUpload: (files: UploadedPRFile[]) => void;
  onFileRemove: (fileId: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
  '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.vue',
  '.svelte', '.html', '.css', '.scss', '.sass', '.less', '.json', '.yaml',
  '.yml', '.xml', '.md', '.txt', '.sql', '.sh', '.bash', '.ps1', '.dockerfile',
  '.gitignore', '.env', '.toml', '.ini', '.cfg', '.conf', '.lock', '.prisma'
];

const getFileIcon = (fileName: string) => {
  const ext = fileName.toLowerCase();
  if (ext.includes('.ts') || ext.includes('.js') || ext.includes('.py') || 
      ext.includes('.java') || ext.includes('.cpp') || ext.includes('.go')) {
    return <FileCode className="w-4 h-4 text-primary" />;
  }
  return <FileText className="w-4 h-4 text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isCodeFile = (fileName: string): boolean => {
  const lowerName = fileName.toLowerCase();
  return CODE_EXTENSIONS.some(ext => lowerName.endsWith(ext)) || 
         !lowerName.includes('.'); // Files without extensions (like Dockerfile, Makefile)
};

export function PRFileUploadSection({ 
  uploadedFiles, 
  onFilesUpload, 
  onFileRemove, 
  onClearAll,
  disabled 
}: PRFileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const processedFiles: UploadedPRFile[] = [];

    for (const file of files) {
      // Skip non-code files and very large files
      if (!isCodeFile(file.name) || file.size > 1024 * 1024) continue;

      try {
        const content = await file.text();
        processedFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          path: (file as any).webkitRelativePath || file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
          uploadedAt: new Date()
        });
      } catch (error) {
        console.error(`Failed to read file: ${file.name}`, error);
      }
    }

    if (processedFiles.length > 0) {
      onFilesUpload(processedFiles);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const items = e.dataTransfer.items;
    const files: File[] = [];

    // Handle both files and directories
    const processEntry = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise((resolve) => {
          fileEntry.file((file) => {
            // Preserve the path
            Object.defineProperty(file, 'webkitRelativePath', {
              value: entry.fullPath.slice(1), // Remove leading slash
              writable: false
            });
            files.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const reader = dirEntry.createReader();
        return new Promise((resolve) => {
          reader.readEntries(async (entries) => {
            await Promise.all(entries.map(processEntry));
            resolve();
          });
        });
      }
    };

    if (items) {
      const entries: FileSystemEntry[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) entries.push(entry);
      }
      await Promise.all(entries.map(processEntry));
      await processFiles(files);
    } else {
      await processFiles(e.dataTransfer.files);
    }
  }, [disabled, onFilesUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
    e.target.value = '';
  }, [onFilesUpload]);

  const handleFolderSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
    e.target.value = '';
  }, [onFilesUpload]);

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="p-4">
          <div
            className="flex flex-col items-center text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <h3 className="font-medium text-sm mb-1">Drop files or folders here</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Supports all programming languages and config files
            </p>

            <div className="flex gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="pr-file-upload"
                disabled={disabled}
              />
              <label htmlFor="pr-file-upload">
                <Button variant="outline" size="sm" className="cursor-pointer" disabled={disabled} asChild>
                  <span className="flex items-center gap-1.5">
                    <File className="w-3.5 h-3.5" />
                    Files
                  </span>
                </Button>
              </label>

              <input
                type="file"
                // @ts-ignore - webkitdirectory is not in types
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                className="hidden"
                id="pr-folder-upload"
                disabled={disabled}
              />
              <label htmlFor="pr-folder-upload">
                <Button variant="outline" size="sm" className="cursor-pointer" disabled={disabled} asChild>
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5" />
                    Folder
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="border-border/50 bg-muted/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{uploadedFiles.length} files uploaded</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={onClearAll}
                disabled={disabled}
              >
                Clear all
              </Button>
            </div>
            <ScrollArea className="h-[120px]">
              <div className="space-y-1.5">
                {uploadedFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-background/50 group"
                  >
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.path || file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onFileRemove(file.id)}
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
