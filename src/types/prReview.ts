export type ReviewMode = 'fast' | 'standard' | 'strict' | 'pre-merge';

export interface PRHealthSummary {
  qualityScore: number; // 1-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mergeReadiness: 'ready' | 'needs-work' | 'blocked';
  confidence: number; // 0-100
  verdict: 'approve' | 'request-changes' | 'comment-only';
}

export interface DiffAwareness {
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  logicChanges: number;
  formattingChanges: number;
  riskyDeletions: string[];
  behaviorAlteringRefactors: string[];
}

export interface PRComment {
  id: string;
  file: string;
  line: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'bug' | 'security' | 'performance' | 'style' | 'architecture' | 'logic' | 'documentation';
  comment: string;
  suggestion?: string;
  snippet?: string;
  isBlocker: boolean;
}

export interface SecurityFinding {
  id: string;
  file: string;
  line: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

export interface PRReviewResult {
  health: PRHealthSummary;
  diffAwareness: DiffAwareness;
  comments: PRComment[];
  securityFindings: SecurityFinding[];
  summary: string;
  reviewMode: ReviewMode;
  timestamp: string;
}

// Review mode configurations
export const REVIEW_MODES: Record<ReviewMode, { 
  name: string; 
  description: string; 
  icon: string;
  focus: string[];
}> = {
  fast: {
    name: 'Fast',
    description: 'Critical issues only',
    icon: 'Zap',
    focus: ['bugs', 'security-critical', 'blockers']
  },
  standard: {
    name: 'Standard',
    description: 'Quality + Security',
    icon: 'Shield',
    focus: ['bugs', 'security', 'performance', 'maintainability']
  },
  strict: {
    name: 'Strict',
    description: 'Architecture + Standards',
    icon: 'Lock',
    focus: ['architecture', 'standards', 'patterns', 'naming', 'documentation']
  },
  'pre-merge': {
    name: 'Pre-Merge',
    description: 'Blockers only',
    icon: 'GitMerge',
    focus: ['blockers', 'breaking-changes', 'regressions']
  }
};

// Analytics types for PR Review
export interface PRReviewAnalytics {
  totalReviews: number;
  averageIssuesPerPR: number;
  securityIssuesFound: number;
  repeatedViolations: Record<string, number>;
  improvementRate: number; // % of issues resolved after review
  reviewsByMode: Record<ReviewMode, number>;
  avgQualityScore: number;
  blockerRate: number; // % of PRs with blockers
}

export interface PRReviewSession {
  reviewId: string;
  timestamp: string;
  mode: ReviewMode;
  result: PRReviewResult;
  inputType: 'diff' | 'files';
}
