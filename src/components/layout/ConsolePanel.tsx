import { useState } from 'react';
import { Terminal, Trash2, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useConsoleStore } from '@/stores/consoleStore';

export function ConsolePanel() {
  const { logs, clearLogs } = useConsoleStore();
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-console-success';
      case 'error':
        return 'text-console-error';
      case 'warning':
        return 'text-console-warning';
      default:
        return 'text-console-info';
    }
  };

  const getLogPrefix = (type: string) => {
    switch (type) {
      case 'success':
        return '[SUCCESS]';
      case 'error':
        return '[ERROR]';
      case 'warning':
        return '[WARN]';
      default:
        return '[INFO]';
    }
  };

  return (
    <div className="h-full flex flex-col bg-console-bg">
      {/* Console Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Console Output</span>
          <span className="text-xs text-muted-foreground">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setFilter(filter === 'all' ? 'error' : 'all')}
          >
            <Filter className="w-3 h-3 mr-1" />
            {filter === 'all' ? 'All' : filter}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearLogs}>
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Console Content */}
      <ScrollArea className="flex-1 p-2">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No console output yet. Start interacting with agents to see logs.
          </div>
        ) : (
          <div className="space-y-1 console-text">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-2 font-mono text-xs">
                <span className="text-muted-foreground shrink-0">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={cn('shrink-0', getLogColor(log.type))}>
                  {getLogPrefix(log.type)}
                </span>
                {log.agentId && (
                  <span className="text-accent shrink-0">[{log.agentId}]</span>
                )}
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
