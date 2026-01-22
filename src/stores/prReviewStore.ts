import { create } from 'zustand';
import { 
  ReviewMode, 
  PRReviewResult, 
  PRReviewAnalytics,
  PRReviewSession 
} from '@/types/prReview';

interface PRReviewState {
  // Current review state
  currentMode: ReviewMode;
  isReviewing: boolean;
  currentResult: PRReviewResult | null;
  
  // Session history
  sessions: PRReviewSession[];
  
  // Analytics
  analytics: PRReviewAnalytics;
  
  // Actions
  setReviewMode: (mode: ReviewMode) => void;
  setIsReviewing: (isReviewing: boolean) => void;
  setCurrentResult: (result: PRReviewResult | null) => void;
  addSession: (session: PRReviewSession) => void;
  updateAnalytics: (result: PRReviewResult) => void;
  clearCurrentReview: () => void;
}

const initialAnalytics: PRReviewAnalytics = {
  totalReviews: 0,
  averageIssuesPerPR: 0,
  securityIssuesFound: 0,
  repeatedViolations: {},
  improvementRate: 0,
  reviewsByMode: {
    fast: 0,
    standard: 0,
    strict: 0,
    'pre-merge': 0
  },
  avgQualityScore: 0,
  blockerRate: 0
};

export const usePRReviewStore = create<PRReviewState>((set, get) => ({
  currentMode: 'standard',
  isReviewing: false,
  currentResult: null,
  sessions: [],
  analytics: initialAnalytics,

  setReviewMode: (mode) => set({ currentMode: mode }),
  
  setIsReviewing: (isReviewing) => set({ isReviewing }),
  
  setCurrentResult: (result) => set({ currentResult: result }),
  
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions].slice(0, 50) // Keep last 50
  })),
  
  updateAnalytics: (result) => set((state) => {
    const { analytics, sessions } = state;
    const totalReviews = analytics.totalReviews + 1;
    
    // Calculate new averages
    const totalIssues = result.comments.length;
    const newAvgIssues = (
      (analytics.averageIssuesPerPR * analytics.totalReviews + totalIssues) / 
      totalReviews
    );
    
    const newSecurityIssues = analytics.securityIssuesFound + result.securityFindings.length;
    
    // Track repeated violations by category
    const violations = { ...analytics.repeatedViolations };
    result.comments.forEach((comment) => {
      violations[comment.category] = (violations[comment.category] || 0) + 1;
    });
    
    // Update mode counts
    const reviewsByMode = { ...analytics.reviewsByMode };
    reviewsByMode[result.reviewMode] = (reviewsByMode[result.reviewMode] || 0) + 1;
    
    // Calculate average quality score
    const allScores = sessions
      .map(s => s.result.health.qualityScore)
      .concat(result.health.qualityScore);
    const newAvgQuality = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    
    // Calculate blocker rate
    const hasBlockers = result.comments.some(c => c.isBlocker);
    const totalWithBlockers = sessions.filter(
      s => s.result.comments.some(c => c.isBlocker)
    ).length + (hasBlockers ? 1 : 0);
    const newBlockerRate = (totalWithBlockers / totalReviews) * 100;
    
    return {
      analytics: {
        totalReviews,
        averageIssuesPerPR: newAvgIssues,
        securityIssuesFound: newSecurityIssues,
        repeatedViolations: violations,
        improvementRate: analytics.improvementRate, // Would need tracking over time
        reviewsByMode,
        avgQualityScore: newAvgQuality,
        blockerRate: newBlockerRate
      }
    };
  }),
  
  clearCurrentReview: () => set({ currentResult: null })
}));
