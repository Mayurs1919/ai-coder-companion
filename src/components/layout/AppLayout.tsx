import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ConsolePanel } from './ConsolePanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [consoleHeight, setConsoleHeight] = useState(25);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={75} minSize={30}>
            <main className="h-full overflow-auto p-4">
              {children}
            </main>
          </ResizablePanel>
          <ResizableHandle className="resize-handle h-1" />
          <ResizablePanel defaultSize={25} minSize={10} maxSize={50}>
            <ConsolePanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
