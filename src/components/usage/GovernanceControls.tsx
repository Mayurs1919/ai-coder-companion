import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageStore } from '@/stores/usageStore';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Settings2, 
  Bell, 
  History, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Info,
  Check,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function GovernanceControls() {
  const { governance, updateGovernanceConfig, acknowledgeAlert } = useUsageStore();
  const [editMode, setEditMode] = useState(false);
  const [tempConfig, setTempConfig] = useState(governance.config);

  const dailyUsagePercent = (governance.currentUsage.daily / governance.config.dailyLimit) * 100;
  const monthlyUsagePercent = (governance.currentUsage.monthly / governance.config.monthlyLimit) * 100;
  const costPercent = (governance.currentUsage.cost / governance.config.costThreshold) * 100;

  const handleSaveConfig = () => {
    updateGovernanceConfig(tempConfig);
    setEditMode(false);
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const unacknowledgedAlerts = governance.alerts.filter((a) => !a.acknowledged);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Governance & Controls
          </CardTitle>
          {unacknowledgedAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs">
              <Bell className="h-3 w-3" />
              {unacknowledgedAlerts.length} alerts
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="limits" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="limits" className="text-xs">
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              Limits
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Limits Tab */}
          <TabsContent value="limits" className="space-y-4">
            {/* Current Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Daily Usage</span>
                <span className="font-medium">
                  {governance.currentUsage.daily} / {governance.config.dailyLimit}
                </span>
              </div>
              <Progress 
                value={dailyUsagePercent} 
                className={cn(
                  "h-2",
                  dailyUsagePercent > 80 && "[&>div]:bg-amber-500",
                  dailyUsagePercent > 95 && "[&>div]:bg-red-500"
                )}
              />
              
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Usage</span>
                <span className="font-medium">
                  {governance.currentUsage.monthly} / {governance.config.monthlyLimit}
                </span>
              </div>
              <Progress 
                value={monthlyUsagePercent}
                className={cn(
                  "h-2",
                  monthlyUsagePercent > 80 && "[&>div]:bg-amber-500",
                  monthlyUsagePercent > 95 && "[&>div]:bg-red-500"
                )}
              />
              
              <div className="flex items-center justify-between text-sm">
                <span>Cost Threshold</span>
                <span className="font-medium">
                  ${governance.currentUsage.cost.toFixed(2)} / ${governance.config.costThreshold}
                </span>
              </div>
              <Progress 
                value={costPercent}
                className={cn(
                  "h-2",
                  costPercent > 80 && "[&>div]:bg-amber-500",
                  costPercent > 95 && "[&>div]:bg-red-500"
                )}
              />
            </div>

            {/* Configuration */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">Configuration</p>
                {!editMode ? (
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                    Edit Limits
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveConfig}>
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {editMode ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit" className="text-xs">Daily Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={tempConfig.dailyLimit}
                      onChange={(e) => setTempConfig({ ...tempConfig, dailyLimit: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit" className="text-xs">Monthly Limit</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      value={tempConfig.monthlyLimit}
                      onChange={(e) => setTempConfig({ ...tempConfig, monthlyLimit: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costThreshold" className="text-xs">Cost Threshold ($)</Label>
                    <Input
                      id="costThreshold"
                      type="number"
                      value={tempConfig.costThreshold}
                      onChange={(e) => setTempConfig({ ...tempConfig, costThreshold: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Alerts Enabled</span>
                  </div>
                  <Switch
                    checked={governance.config.alertsEnabled}
                    onCheckedChange={(checked) => updateGovernanceConfig({ alertsEnabled: checked })}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-3">
            {governance.alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No alerts</p>
              </div>
            ) : (
              governance.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    alert.acknowledged && 'opacity-60',
                    alert.severity === 'critical' && 'bg-red-500/5 border-red-500/20',
                    alert.severity === 'warning' && 'bg-amber-500/5 border-amber-500/20',
                    alert.severity === 'info' && 'bg-blue-500/5 border-blue-500/20'
                  )}
                >
                  <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs h-9">User</TableHead>
                    <TableHead className="text-xs h-9">Agent</TableHead>
                    <TableHead className="text-xs h-9">Action</TableHead>
                    <TableHead className="text-xs h-9 text-right">Tokens</TableHead>
                    <TableHead className="text-xs h-9 text-right">Cost</TableHead>
                    <TableHead className="text-xs h-9 text-center">Status</TableHead>
                    <TableHead className="text-xs h-9 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {governance.auditTrail.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/20">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-xs font-medium">{entry.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{entry.agentName}</TableCell>
                      <TableCell className="py-2 text-xs max-w-32 truncate">{entry.action}</TableCell>
                      <TableCell className="py-2 text-xs text-right">{entry.tokens.toLocaleString()}</TableCell>
                      <TableCell className="py-2 text-xs text-right">${entry.cost.toFixed(3)}</TableCell>
                      <TableCell className="py-2 text-center">{getStatusIcon(entry.status)}</TableCell>
                      <TableCell className="py-2 text-xs text-right text-muted-foreground">
                        {format(new Date(entry.timestamp), 'h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
