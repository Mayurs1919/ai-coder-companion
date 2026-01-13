import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsageStore } from '@/stores/usageStore';
import { FileCode, FileText, Download, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const formatColors: Record<string, string> = {
  ts: 'hsl(var(--primary))',
  tsx: 'hsl(var(--console-info))',
  py: 'hsl(var(--console-warning))',
  java: 'hsl(var(--destructive))',
  md: 'hsl(var(--console-success))',
  yaml: 'hsl(210, 40%, 50%)',
  json: 'hsl(280, 60%, 60%)',
  sql: 'hsl(30, 80%, 50%)',
  other: 'hsl(var(--muted-foreground))',
};

export function ArtifactTracking() {
  const { artifactStats } = useUsageStore();

  const pieData = Object.entries(artifactStats.byFormat).map(([format, count]) => ({
    name: format.toUpperCase(),
    value: count,
    color: formatColors[format] || formatColors.other,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Summary Cards */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Artifact Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
              <FileCode className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{artifactStats.totalGenerated}</p>
              <p className="text-xs text-muted-foreground">Files Generated</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Download className="w-6 h-6 mx-auto mb-2 text-console-success" />
              <p className="text-2xl font-bold">{artifactStats.totalDownloaded}</p>
              <p className="text-xs text-muted-foreground">Files Downloaded</p>
            </div>
          </div>

          {/* Format Distribution */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center">
            {pieData.slice(0, 6).map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent & Top Artifacts */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Artifacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {artifactStats.recentArtifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-muted">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{artifact.filename}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(artifact.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {artifact.format.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {artifact.downloads} <Download className="w-3 h-3 inline" />
                </span>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm font-medium mb-3">Most Generated</p>
            {artifactStats.mostGenerated.slice(0, 3).map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-muted-foreground truncate max-w-[180px]">
                  {artifact.filename}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {artifact.downloads} downloads
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
