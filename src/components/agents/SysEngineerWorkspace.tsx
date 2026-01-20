import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ClipboardList, 
  FileCheck, 
  TestTube, 
  Loader2, 
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadSection } from '@/components/sysEngineer/FileUploadSection';
import { UseCaseTable } from '@/components/sysEngineer/UseCaseTable';
import { RequirementTable } from '@/components/sysEngineer/RequirementTable';
import { TestCaseTable } from '@/components/sysEngineer/TestCaseTable';
import { EngineerReviewModal } from '@/components/sysEngineer/EngineerReviewModal';
import { useSysEngineerStore } from '@/stores/sysEngineerStore';
import { UploadedFile, UseCase, Requirement, TestCase } from '@/types/sysEngineer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SYS_ENGINEER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sys-engineer`;

export function SysEngineerWorkspace() {
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('use-cases');
  
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
    setError,
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
    setError(null);
    
    try {
      const response = await fetch(SYS_ENGINEER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'generate_use_cases',
          documentContent: uploadedFile.content || `Document: ${uploadedFile.name}\nType: ${uploadedFile.type}\nSize: ${uploadedFile.size} bytes\n\nPlease analyze this document and generate comprehensive use cases.`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('Payment required. Please add credits to continue.');
        } else {
          toast.error(errorData.error || 'Failed to generate use cases');
        }
        throw new Error(errorData.error || 'Failed to generate use cases');
      }

      const data = await response.json();
      
      // Transform API response to match our UseCase type
      const generatedUseCases: UseCase[] = (data.use_cases || []).map((uc: {
        use_case_id?: string;
        use_case_name?: string;
        description?: string;
        actor?: string;
        stakeholders?: string[];
        priority?: string;
        pre_condition?: string;
        status?: string;
      }, idx: number) => ({
        id: String(idx + 1),
        srNo: idx + 1,
        useCaseId: uc.use_case_id || `UC-${String(idx + 1).padStart(3, '0')}`,
        useCaseName: uc.use_case_name || `Use Case ${idx + 1}`,
        description: uc.description || '',
        actor: uc.actor || 'User',
        stakeholders: uc.stakeholders || ['Developers', 'DevOps', 'QA', 'PM', 'Security'],
        priority: (uc.priority as 'Low' | 'Medium' | 'High') || 'Medium',
        preCondition: uc.pre_condition || '',
        status: 'Draft' as const,
        selected: false,
      }));

      if (generatedUseCases.length === 0) {
        toast.warning('No use cases could be extracted from the document');
      } else {
        toast.success(`Generated ${generatedUseCases.length} use cases`);
      }

      setUseCases(generatedUseCases);
    } catch (error) {
      console.error('Error generating use cases:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRequirements = async () => {
    if (selectedUseCases.length === 0) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      // Transform selected use cases to the format expected by the API
      const useCasesForApi = selectedUseCases.map(uc => ({
        use_case_id: uc.useCaseId,
        use_case_name: uc.useCaseName,
        description: uc.description,
        actor: uc.actor,
        stakeholders: uc.stakeholders,
        priority: uc.priority,
        pre_condition: uc.preCondition,
        status: uc.status,
      }));

      const response = await fetch(SYS_ENGINEER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'generate_requirements',
          useCases: useCasesForApi,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('Payment required. Please add credits to continue.');
        } else {
          toast.error(errorData.error || 'Failed to generate requirements');
        }
        throw new Error(errorData.error || 'Failed to generate requirements');
      }

      const data = await response.json();
      
      // Transform API response to match our Requirement type
      const generatedRequirements: Requirement[] = (data.requirements || []).map((req: {
        requirement_id?: string;
        use_case_id?: string;
        requirement_title?: string;
        requirement_text?: string;
        requirement_type?: string;
        description?: string;
        priority?: string;
        status?: string;
      }, idx: number) => ({
        id: String(idx + 1),
        srNo: idx + 1,
        useCaseId: req.use_case_id || 'UC-001',
        requirementId: req.requirement_id || `REQ-${String(idx + 1).padStart(3, '0')}`,
        requirementTitle: req.requirement_title || req.requirement_text || `Requirement ${idx + 1}`,
        description: req.description || '',
        type: (req.requirement_type === 'Non-Functional' ? 'Non-Functional' : 'Functional') as 'Functional' | 'Non-Functional',
        priority: (req.priority as 'Low' | 'Medium' | 'High') || 'Medium',
        status: 'Draft' as const,
        selected: false,
      }));

      if (generatedRequirements.length === 0) {
        toast.warning('No requirements could be generated from the selected use cases');
      } else {
        toast.success(`Generated ${generatedRequirements.length} requirements`);
      }

      setRequirements(generatedRequirements);
      setActiveTab('requirements'); // Auto-switch to Requirements tab
    } catch (error) {
      console.error('Error generating requirements:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTestCases = async () => {
    if (selectedRequirements.length === 0) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      // Transform selected requirements to the format expected by the API
      const requirementsForApi = selectedRequirements.map(req => ({
        requirement_id: req.requirementId,
        use_case_id: req.useCaseId,
        requirement_title: req.requirementTitle,
        requirement_type: req.type,
        description: req.description,
        priority: req.priority,
        status: req.status,
      }));

      // Get related use cases for the selected requirements
      const relatedUseCaseIds = [...new Set(selectedRequirements.map(r => r.useCaseId))];
      const relatedUseCases = useCases
        .filter(uc => relatedUseCaseIds.includes(uc.useCaseId))
        .map(uc => ({
          use_case_id: uc.useCaseId,
          use_case_name: uc.useCaseName,
          description: uc.description,
          actor: uc.actor,
          stakeholders: uc.stakeholders,
          priority: uc.priority,
          pre_condition: uc.preCondition,
          status: uc.status,
        }));

      const response = await fetch(SYS_ENGINEER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'generate_test_cases',
          requirements: requirementsForApi,
          useCases: relatedUseCases,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('Payment required. Please add credits to continue.');
        } else {
          toast.error(errorData.error || 'Failed to generate test cases');
        }
        throw new Error(errorData.error || 'Failed to generate test cases');
      }

      const data = await response.json();
      
      // Transform API response to match our TestCase type
      const generatedTestCases: TestCase[] = (data.test_cases || []).map((tc: {
        test_case_id?: string;
        use_case_id?: string;
        requirement_id?: string;
        test_case_name?: string;
        priority?: string;
        type?: string;
        precondition?: string;
        postcondition?: string;
        action?: string;
        expected_result?: string;
      }, idx: number) => ({
        id: String(idx + 1),
        srNo: idx + 1,
        useCaseId: tc.use_case_id || 'UC-001',
        requirementId: tc.requirement_id || 'REQ-001',
        testCaseId: tc.test_case_id || `TC-${String(idx + 1).padStart(3, '0')}`,
        testCaseName: tc.test_case_name || `Test Case ${idx + 1}`,
        priority: (tc.priority as 'Low' | 'Medium' | 'High') || 'Medium',
        type: (tc.type as 'Functional' | 'UI' | 'Security') || 'Functional',
        precondition: tc.precondition || '',
        postcondition: tc.postcondition || '',
        action: tc.action || '',
        expectedResult: tc.expected_result || '',
      }));

      if (generatedTestCases.length === 0) {
        toast.warning('No test cases could be generated from the selected requirements');
      } else {
        toast.success(`Generated ${generatedTestCases.length} test cases`);
      }

      setTestCases(generatedTestCases);
      setActiveTab('test-cases'); // Auto-switch to Test Cases tab
    } catch (error) {
      console.error('Error generating test cases:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = (format: 'docx' | 'pdf' | 'xlsx' | 'txt') => {
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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
