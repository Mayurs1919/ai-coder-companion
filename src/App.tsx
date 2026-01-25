import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AgentWorkspace } from "@/components/agents/AgentWorkspace";
import { PRReviewerWorkspace } from "@/components/agents/PRReviewerWorkspace";
import { MicroservicesWorkspace } from "@/components/agents/MicroservicesWorkspace";
import { SysEngineerWorkspace } from "@/components/agents/SysEngineerWorkspace";
import { UsageSection } from "@/components/usage/UsageSection";
import { ExecutionSurface } from "@/components/execution/ExecutionSurface";
import { LandingPage } from "@/components/landing/LandingPage";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* AI IDE Execution Surface - Main Interface */}
            <Route
              path="/execute"
              element={
                <ProtectedRoute>
                  <ExecutionSurface />
                </ProtectedRoute>
              }
            />
            
            {/* Protected dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/usage"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UsageSection />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/microservices"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MicroservicesWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/sys-engineer"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SysEngineerWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/reviewer"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PRReviewerWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/:agentId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AgentWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold mb-4">Security Scan</h1>
                      <p className="text-muted-foreground">Coming in Phase 4</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
