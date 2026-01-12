import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ConsolePanel } from './ConsolePanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [consoleVisible, setConsoleVisible] = useState(true);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {consoleVisible ? (
            <ResizablePanelGroup direction="vertical" className="flex-1">
              <ResizablePanel defaultSize={75} minSize={30}>
                <main className="h-full overflow-auto p-4">
                  {children}
                </main>
              </ResizablePanel>
              <ResizableHandle className="resize-handle h-1" />
              <ResizablePanel defaultSize={25} minSize={10} maxSize={50}>
                <ConsolePanel onToggle={() => setConsoleVisible(false)} />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <>
              <main className="flex-1 overflow-auto p-4">
                {children}
              </main>
              {/* Collapsed console bar */}
              <div className="h-10 flex items-center justify-between px-4 border-t border-border bg-card/50">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Console</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setConsoleVisible(true)}
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  <span className="text-xs">Show</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
