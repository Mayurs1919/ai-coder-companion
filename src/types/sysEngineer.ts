export type WorkflowStage = 'upload' | 'use-cases' | 'requirements' | 'test-cases';
export type ItemStatus = 'Draft' | 'In-Progress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';
export type Actor = 'User' | 'Admin' | 'System';
export type Stakeholder = 'Developers' | 'DevOps' | 'QA' | 'PMA' | 'Security';
export type RequirementType = 'Functional' | 'Non-Functional';
export type TestCaseType = 'Functional' | 'UI' | 'Security';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  content?: string;
}

export interface UseCase {
  id: string;
  srNo: number;
  useCaseId: string;
  useCaseName: string;
  description: string;
  actor: Actor;
  stakeholders: Stakeholder[];
  priority: Priority;
  preCondition: string;
  status: ItemStatus;
  selected?: boolean;
}

export interface Requirement {
  id: string;
  srNo: number;
  useCaseId: string;
  requirementId: string;
  requirementTitle: string;
  description: string;
  type: RequirementType;
  priority: Priority;
  status: ItemStatus;
  selected?: boolean;
}

export interface TestCase {
  id: string;
  srNo: number;
  useCaseId: string;
  requirementId: string;
  testCaseId: string;
  testCaseName: string;
  priority: Priority;
  type: TestCaseType;
  precondition: string;
  postcondition: string;
  action: string;
  expectedResult: string;
}

export interface TraceabilityItem {
  useCaseId: string;
  useCaseName: string;
  requirements: {
    requirementId: string;
    requirementTitle: string;
    testCases: {
      testCaseId: string;
      testCaseName: string;
    }[];
  }[];
}

export interface SysEngineerState {
  currentStage: WorkflowStage;
  uploadedFile: UploadedFile | null;
  useCases: UseCase[];
  requirements: Requirement[];
  testCases: TestCase[];
  isProcessing: boolean;
  error: string | null;
}
