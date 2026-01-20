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
import { Requirement, Priority, ItemStatus, RequirementType } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';
import { ExportDropdown } from './ExportDropdown';
import { exportRequirementsToDocx, exportRequirementsToXlsx } from '@/lib/exportUtils';

interface RequirementTableProps {
  requirements: Requirement[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}

type SortField = 'srNo' | 'useCaseId' | 'requirementId' | 'type' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

const priorityOrder: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 };
const statusOrder: Record<ItemStatus, number> = { Draft: 0, 'In-Progress': 1, Completed: 2 };

export function RequirementTable({ requirements, onToggleSelection, onSelectAll }: RequirementTableProps) {
  const [sortField, setSortField] = useState<SortField>('srNo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const allSelected = requirements.length > 0 && requirements.every((req) => req.selected);
  const someSelected = requirements.some((req) => req.selected);

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

  const sortedRequirements = [...requirements].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'srNo':
        comparison = a.srNo - b.srNo;
        break;
      case 'useCaseId':
        comparison = a.useCaseId.localeCompare(b.useCaseId);
        break;
      case 'requirementId':
        comparison = a.requirementId.localeCompare(b.requirementId);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
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

  const getTypeVariant = (type: RequirementType) => {
    switch (type) {
      case 'Functional': return 'default';
      case 'Non-Functional': return 'outline';
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
          onExportDocx={() => exportRequirementsToDocx(requirements)}
          onExportXlsx={() => exportRequirementsToXlsx(requirements)}
          disabled={requirements.length === 0}
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
              <TableHead className="w-[100px]">
                <SortHeader field="requirementId">Req ID</SortHeader>
              </TableHead>
              <TableHead className="min-w-[200px]">Requirement Title</TableHead>
              <TableHead className="w-[120px]">
                <SortHeader field="type">Type</SortHeader>
              </TableHead>
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
            {sortedRequirements.map((req) => (
              <>
                <TableRow 
                  key={req.id} 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    req.selected && "bg-primary/5"
                  )}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={req.selected}
                      onCheckedChange={() => onToggleSelection(req.id)}
                      aria-label={`Select ${req.requirementTitle}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{req.srNo}</TableCell>
                  <TableCell className="font-mono text-xs">{req.useCaseId}</TableCell>
                  <TableCell className="font-mono text-xs font-medium">{req.requirementId}</TableCell>
                  <TableCell className="font-medium">{req.requirementTitle}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(req.type)} className="text-xs">
                      {req.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(req.priority)} className="text-xs">
                      {req.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium", getStatusColor(req.status))}>
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleRowExpansion(req.id)}
                    >
                      {expandedRows.has(req.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(req.id) && (
                  <TableRow key={`${req.id}-details`} className="bg-muted/20">
                    <TableCell colSpan={9} className="py-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1">{req.description}</p>
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
