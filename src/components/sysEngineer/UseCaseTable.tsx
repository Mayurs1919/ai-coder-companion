import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UseCase, Priority, ItemStatus } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';
import { ExportDropdown } from './ExportDropdown';
import { exportUseCasesToDocx, exportUseCasesToXlsx } from '@/lib/exportUtils';
interface UseCaseTableProps {
  useCases: UseCase[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}

type SortField = 'srNo' | 'useCaseId' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

const priorityOrder: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 };
const statusOrder: Record<ItemStatus, number> = { Draft: 0, 'In-Progress': 1, Completed: 2 };

export function UseCaseTable({ useCases, onToggleSelection, onSelectAll }: UseCaseTableProps) {
  const [sortField, setSortField] = useState<SortField>('srNo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const allSelected = useCases.length > 0 && useCases.every((uc) => uc.selected);
  const someSelected = useCases.some((uc) => uc.selected);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sortedUseCases = [...useCases].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'srNo':
        comparison = a.srNo - b.srNo;
        break;
      case 'useCaseId':
        comparison = a.useCaseId.localeCompare(b.useCaseId);
        break;
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getPriorityVariant = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'Completed': return 'text-console-success';
      case 'In-Progress': return 'text-console-warning';
      case 'Draft': return 'text-muted-foreground';
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 -ml-2 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ExportDropdown
          onExportDocx={() => exportUseCasesToDocx(useCases)}
          onExportXlsx={() => exportUseCasesToXlsx(useCases)}
          disabled={useCases.length === 0}
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="max-h-[500px]">
        <Table>
          <TableHeader className="bg-muted/40 sticky top-0">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => onSelectAll(!allSelected)}
                  aria-label="Select all"
                  className={cn(someSelected && !allSelected && "opacity-50")}
                />
              </TableHead>
              <TableHead className="w-[60px]">
                <SortHeader field="srNo">Sr.</SortHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="useCaseId">UC ID</SortHeader>
              </TableHead>
              <TableHead className="min-w-[200px]">Use Case Name</TableHead>
              <TableHead className="w-[80px]">Actor</TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="priority">Priority</SortHeader>
              </TableHead>
              <TableHead className="w-[110px]">
                <SortHeader field="status">Status</SortHeader>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUseCases.map((uc) => (
              <>
                <TableRow 
                  key={uc.id} 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    uc.selected && "bg-primary/5"
                  )}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={uc.selected}
                      onCheckedChange={() => onToggleSelection(uc.id)}
                      aria-label={`Select ${uc.useCaseName}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{uc.srNo}</TableCell>
                  <TableCell className="font-mono text-xs font-medium">{uc.useCaseId}</TableCell>
                  <TableCell className="font-medium">{uc.useCaseName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{uc.actor}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(uc.priority)} className="text-xs">
                      {uc.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium", getStatusColor(uc.status))}>
                      {uc.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleRowExpansion(uc.id)}
                    >
                      {expandedRows.has(uc.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(uc.id) && (
                  <TableRow key={`${uc.id}-details`} className="bg-muted/20">
                    <TableCell colSpan={8} className="py-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Description:</span>
                          <p className="mt-1">{uc.description}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pre-Condition:</span>
                          <p className="mt-1">{uc.preCondition}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Stakeholders:</span>
                          <div className="flex gap-1 mt-1">
                            {uc.stakeholders.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      </div>
    </div>
  );
}
