import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportDropdownProps {
  onExportDocx: () => void;
  onExportXlsx: () => void;
  disabled?: boolean;
}

export function ExportDropdown({ onExportDocx, onExportXlsx, disabled }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportDocx} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export as DOCX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportXlsx} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export as XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
