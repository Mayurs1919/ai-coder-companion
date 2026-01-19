import { create } from 'zustand';
import { 
  SysEngineerState, 
  WorkflowStage, 
  UploadedFile, 
  UseCase, 
  Requirement, 
  TestCase 
} from '@/types/sysEngineer';

interface SysEngineerStore extends SysEngineerState {
  setStage: (stage: WorkflowStage) => void;
  setUploadedFile: (file: UploadedFile | null) => void;
  setUseCases: (useCases: UseCase[]) => void;
  toggleUseCaseSelection: (id: string) => void;
  selectAllUseCases: (selected: boolean) => void;
  setRequirements: (requirements: Requirement[]) => void;
  toggleRequirementSelection: (id: string) => void;
  selectAllRequirements: (selected: boolean) => void;
  setTestCases: (testCases: TestCase[]) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  getSelectedUseCases: () => UseCase[];
  getSelectedRequirements: () => Requirement[];
}

const initialState: SysEngineerState = {
  currentStage: 'upload',
  uploadedFile: null,
  useCases: [],
  requirements: [],
  testCases: [],
  isProcessing: false,
  error: null,
};

export const useSysEngineerStore = create<SysEngineerStore>((set, get) => ({
  ...initialState,

  setStage: (stage) => set({ currentStage: stage }),

  setUploadedFile: (file) => set({ uploadedFile: file }),

  setUseCases: (useCases) => set({ useCases, currentStage: 'use-cases' }),

  toggleUseCaseSelection: (id) => set((state) => ({
    useCases: state.useCases.map((uc) =>
      uc.id === id ? { ...uc, selected: !uc.selected } : uc
    ),
  })),

  selectAllUseCases: (selected) => set((state) => ({
    useCases: state.useCases.map((uc) => ({ ...uc, selected })),
  })),

  setRequirements: (requirements) => set({ requirements, currentStage: 'requirements' }),

  toggleRequirementSelection: (id) => set((state) => ({
    requirements: state.requirements.map((req) =>
      req.id === id ? { ...req, selected: !req.selected } : req
    ),
  })),

  selectAllRequirements: (selected) => set((state) => ({
    requirements: state.requirements.map((req) => ({ ...req, selected })),
  })),

  setTestCases: (testCases) => set({ testCases, currentStage: 'test-cases' }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),

  getSelectedUseCases: () => get().useCases.filter((uc) => uc.selected),

  getSelectedRequirements: () => get().requirements.filter((req) => req.selected),
}));
