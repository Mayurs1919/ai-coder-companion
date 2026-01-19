import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { TestCase, Priority, TestCaseType } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';

interface TestCaseTableProps {
  testCases: TestCase[];
}

type SortField = 'srNo' | 'useCaseId' | 'requirementId' | 'testCaseId' | 'type' | 'priority';
type SortDirection = 'asc' | 'desc';

const priorityOrder: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 };

export function TestCaseTable({ testCases }: TestCaseTableProps) {
  const [sortField, setSortField] = useState<SortField>('srNo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const sortedTestCases = [...testCases].sort((a, b) => {
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
      case 'testCaseId':
        comparison = a.testCaseId.localeCompare(b.testCaseId);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
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

  const getTypeColor = (type: TestCaseType) => {
    switch (type) {
      case 'Functional': return 'bg-primary/20 text-primary';
      case 'UI': return 'bg-agent-refactor/20 text-agent-refactor';
      case 'Security': return 'bg-destructive/20 text-destructive';
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
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="max-h-[500px]">
        <Table>
          <TableHeader className="bg-muted/40 sticky top-0">
            <TableRow>
              <TableHead className="w-[60px]">
                <SortHeader field="srNo">Sr.</SortHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="useCaseId">UC ID</SortHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="requirementId">Req ID</SortHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="testCaseId">TC ID</SortHeader>
              </TableHead>
              <TableHead className="min-w-[200px]">Test Case Name</TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="type">Type</SortHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortHeader field="priority">Priority</SortHeader>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTestCases.map((tc) => (
              <>
                <TableRow 
                  key={tc.id} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-xs">{tc.srNo}</TableCell>
                  <TableCell className="font-mono text-xs">{tc.useCaseId}</TableCell>
                  <TableCell className="font-mono text-xs">{tc.requirementId}</TableCell>
                  <TableCell className="font-mono text-xs font-medium">{tc.testCaseId}</TableCell>
                  <TableCell className="font-medium">{tc.testCaseName}</TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", getTypeColor(tc.type))}>
                      {tc.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(tc.priority)} className="text-xs">
                      {tc.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleRowExpansion(tc.id)}
                    >
                      {expandedRows.has(tc.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(tc.id) && (
                  <TableRow key={`${tc.id}-details`} className="bg-muted/20">
                    <TableCell colSpan={8} className="py-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground font-medium">Precondition:</span>
                          <p className="mt-1">{tc.precondition}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Postcondition:</span>
                          <p className="mt-1">{tc.postcondition}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Action:</span>
                          <p className="mt-1">{tc.action}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Expected Result:</span>
                          <p className="mt-1">{tc.expectedResult}</p>
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
  );
}
