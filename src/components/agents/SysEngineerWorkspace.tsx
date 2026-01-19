import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ClipboardList, 
  FileCheck, 
  TestTube, 
  Loader2, 
  Maximize2,
  Download,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadSection } from '@/components/sysEngineer/FileUploadSection';
import { UseCaseTable } from '@/components/sysEngineer/UseCaseTable';
import { RequirementTable } from '@/components/sysEngineer/RequirementTable';
import { TestCaseTable } from '@/components/sysEngineer/TestCaseTable';
import { TraceabilityMatrix } from '@/components/sysEngineer/TraceabilityMatrix';
import { EngineerReviewModal } from '@/components/sysEngineer/EngineerReviewModal';
import { useSysEngineerStore } from '@/stores/sysEngineerStore';
import { UploadedFile, UseCase, Requirement, TestCase } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';

export function SysEngineerWorkspace() {
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  
  const {
    currentStage,
    uploadedFile,
    useCases,
    requirements,
    testCases,
    isProcessing,
    setUploadedFile,
    setUseCases,
    toggleUseCaseSelection,
    selectAllUseCases,
    setRequirements,
    toggleRequirementSelection,
    selectAllRequirements,
    setTestCases,
    setIsProcessing,
    getSelectedUseCases,
    getSelectedRequirements,
    reset,
  } = useSysEngineerStore();

  const selectedUseCases = getSelectedUseCases();
  const selectedRequirements = getSelectedRequirements();

  const handleFileUpload = useCallback((file: UploadedFile) => {
    setUploadedFile(file);
  }, [setUploadedFile]);

  const handleFileRemove = useCallback(() => {
    reset();
  }, [reset]);

  const generateUseCases = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    
    // Simulated generation - in real app, call edge function
    await new Promise(r => setTimeout(r, 2000));
    
    const mockUseCases: UseCase[] = [
      { id: '1', srNo: 1, useCaseId: 'UC_001', useCaseName: 'User Authentication', description: 'Allow users to login with credentials', actor: 'User', stakeholders: ['Developers', 'Security'], priority: 'High', preCondition: 'User has valid credentials', status: 'Draft', selected: false },
      { id: '2', srNo: 2, useCaseId: 'UC_002', useCaseName: 'Password Reset', description: 'Enable users to reset forgotten passwords', actor: 'User', stakeholders: ['Developers', 'QA'], priority: 'Medium', preCondition: 'User has registered email', status: 'Draft', selected: false },
      { id: '3', srNo: 3, useCaseId: 'UC_003', useCaseName: 'Admin Dashboard Access', description: 'Provide admin users with dashboard access', actor: 'Admin', stakeholders: ['Developers', 'PMA'], priority: 'High', preCondition: 'User has admin role', status: 'Draft', selected: false },
    ];
    
    setUseCases(mockUseCases);
    setIsProcessing(false);
  };

  const generateRequirements = async () => {
    if (selectedUseCases.length === 0) return;
    setIsProcessing(true);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const mockRequirements: Requirement[] = selectedUseCases.flatMap((uc, idx) => [
      { id: `req-${idx}-1`, srNo: idx * 2 + 1, useCaseId: uc.useCaseId, requirementId: `REQ_${String(idx * 2 + 1).padStart(3, '0')}`, requirementTitle: `${uc.useCaseName} - Validation`, description: `Implement validation for ${uc.useCaseName}`, type: 'Functional' as const, priority: uc.priority, status: 'Draft' as const, selected: false },
      { id: `req-${idx}-2`, srNo: idx * 2 + 2, useCaseId: uc.useCaseId, requirementId: `REQ_${String(idx * 2 + 2).padStart(3, '0')}`, requirementTitle: `${uc.useCaseName} - Performance`, description: `Ensure performance criteria for ${uc.useCaseName}`, type: 'Non-Functional' as const, priority: 'Medium' as const, status: 'Draft' as const, selected: false },
    ]);
    
    setRequirements(mockRequirements);
    setIsProcessing(false);
  };

  const generateTestCases = async () => {
    if (selectedRequirements.length === 0) return;
    setIsProcessing(true);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const mockTestCases: TestCase[] = selectedRequirements.map((req, idx) => ({
      id: `tc-${idx}`,
      srNo: idx + 1,
      useCaseId: req.useCaseId,
      requirementId: req.requirementId,
      testCaseId: `TC_${String(idx + 1).padStart(3, '0')}`,
      testCaseName: `Verify ${req.requirementTitle}`,
      priority: req.priority,
      type: req.type === 'Functional' ? 'Functional' as const : 'UI' as const,
      precondition: 'System is running, test data is available',
      postcondition: 'Expected state is achieved',
      action: `Execute ${req.requirementTitle} workflow`,
      expectedResult: `${req.requirementTitle} completes successfully`,
    }));
    
    setTestCases(mockTestCases);
    setIsProcessing(false);
  };

  const handleExport = (format: 'docx' | 'pdf' | 'xlsx' | 'txt') => {
    // Placeholder for export functionality
    console.log(`Exporting as ${format}`);
  };

  const getStageNumber = () => {
    switch (currentStage) {
      case 'upload': return 1;
      case 'use-cases': return 2;
      case 'requirements': return 3;
      case 'test-cases': return 4;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-agent-sys-engineer/20">
          <ClipboardList className="w-6 h-6 text-agent-sys-engineer" />
        </div>
        <div>
          <h1 className="text-xl font-bold">SysEngineer</h1>
          <p className="text-sm text-muted-foreground">Generate Use Cases, Requirements, and Test Cases</p>
        </div>
        <Badge variant={isProcessing ? 'default' : 'secondary'} className={cn('ml-auto', isProcessing && 'animate-pulse')}>
          {isProcessing ? 'Processing...' : `Stage ${getStageNumber()}/4`}
        </Badge>
      </div>

      {/* Workflow Progress */}
      <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-muted/30 border">
        {['Upload', 'Use Cases', 'Requirements', 'Test Cases'].map((stage, idx) => (
          <div key={stage} className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
              getStageNumber() > idx + 1 ? 'bg-console-success text-console-success-foreground' :
              getStageNumber() === idx + 1 ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            )}>
              {idx + 1}
            </div>
            <span className={cn('text-sm', getStageNumber() >= idx + 1 ? 'text-foreground' : 'text-muted-foreground')}>{stage}</span>
            {idx < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
        
        {(useCases.length > 0 || requirements.length > 0 || testCases.length > 0) && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setReviewModalOpen(true)}>
            <Maximize2 className="w-4 h-4 mr-1" />
            Full Review
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Card className="flex-1 min-h-0">
        <CardContent className="p-6 h-full flex flex-col">
          {currentStage === 'upload' && (
            <div className="space-y-6">
              <FileUploadSection uploadedFile={uploadedFile} onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} disabled={isProcessing} />
              {uploadedFile && (
                <div className="flex justify-end">
                  <Button onClick={generateUseCases} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ClipboardList className="w-4 h-4 mr-2" />}
                    Generate Use Cases
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStage !== 'upload' && (
            <Tabs defaultValue={currentStage} className="flex-1 flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="use-cases" disabled={useCases.length === 0}>
                  <ClipboardList className="w-4 h-4 mr-2" />Use Cases ({useCases.length})
                </TabsTrigger>
                <TabsTrigger value="requirements" disabled={requirements.length === 0}>
                  <FileCheck className="w-4 h-4 mr-2" />Requirements ({requirements.length})
                </TabsTrigger>
                <TabsTrigger value="test-cases" disabled={testCases.length === 0}>
                  <TestTube className="w-4 h-4 mr-2" />Test Cases ({testCases.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="use-cases" className="flex-1 flex flex-col gap-4">
                <UseCaseTable useCases={useCases} onToggleSelection={toggleUseCaseSelection} onSelectAll={selectAllUseCases} />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{selectedUseCases.length} selected</span>
                  <Button onClick={generateRequirements} disabled={selectedUseCases.length === 0 || isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck className="w-4 h-4 mr-2" />}
                    Generate Requirements
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="flex-1 flex flex-col gap-4">
                <RequirementTable requirements={requirements} onToggleSelection={toggleRequirementSelection} onSelectAll={selectAllRequirements} />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{selectedRequirements.length} selected</span>
                  <Button onClick={generateTestCases} disabled={selectedRequirements.length === 0 || isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                    Generate Test Cases
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="test-cases" className="flex-1">
                <TestCaseTable testCases={testCases} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <EngineerReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        useCases={useCases}
        requirements={requirements}
        testCases={testCases}
        onExport={handleExport}
      />
    </div>
  );
}
