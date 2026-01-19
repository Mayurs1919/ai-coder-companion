import { useState, useCallback } from 'react';
import { Upload, File, X, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/types/sysEngineer';

interface FileUploadSectionProps {
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: UploadedFile) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

const SUPPORTED_FORMATS = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
const FORMAT_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/plain': 'TXT',
};

export function FileUploadSection({ uploadedFile, onFileUpload, onFileRemove, disabled }: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && SUPPORTED_FORMATS.includes(file.type)) {
      processFile(file);
    }
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && SUPPORTED_FORMATS.includes(file.type)) {
      processFile(file);
    }
    e.target.value = '';
  }, []);

  const processFile = (file: File) => {
    const uploadedFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    };
    onFileUpload(uploadedFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-destructive" />;
    if (type.includes('spreadsheet')) return <FileSpreadsheet className="w-8 h-8 text-console-success" />;
    if (type.includes('word')) return <FileType className="w-8 h-8 text-primary" />;
    return <File className="w-8 h-8 text-muted-foreground" />;
  };

  if (uploadedFile) {
    return (
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {getFileIcon(uploadedFile.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {FORMAT_LABELS[uploadedFile.type] || 'File'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onFileRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <CardContent className="p-8">
        <div
          className="flex flex-col items-center text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <h3 className="font-semibold mb-1">Drop your document here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>

          <input
            type="file"
            accept=".pdf,.docx,.xlsx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={disabled}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" disabled={disabled} asChild>
              <span>Upload File</span>
            </Button>
          </label>

          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">PDF</Badge>
            <Badge variant="secondary" className="text-xs">DOCX</Badge>
            <Badge variant="secondary" className="text-xs">XLSX</Badge>
            <Badge variant="secondary" className="text-xs">TXT</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
