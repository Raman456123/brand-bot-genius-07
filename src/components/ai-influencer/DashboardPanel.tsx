
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ActivityLogs } from "@/components/ai-influencer/ActivityLogs";
import { AIStateCard } from "@/components/ai-influencer/AIStateCard";

interface ActivityLog {
  timestamp: string;
  activity_type: string;
  success: boolean;
  error: string | null;
  data: any;
}

interface DashboardPanelProps {
  logs: ActivityLog[];
  isRunning: boolean;
  currentActivity: string | null;
  brainState: {
    energy: number;
    mood: string;
    lastActivity: string;
  };
  logsEndRef: React.RefObject<HTMLDivElement>;
}

export function DashboardPanel({ logs, isRunning, currentActivity, brainState, logsEndRef }: DashboardPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLogs logs={logs} />
            <div ref={logsEndRef} />
          </CardContent>
        </Card>
        
        <AIStateCard 
          isRunning={isRunning}
          currentActivity={currentActivity}
          brainState={brainState}
        />
      </div>
      
      <Alert>
        <AlertDescription>
          The AI Influencer's activities simulate actions based on the Pippin framework. Configure API keys in the Configuration tab.
        </AlertDescription>
      </Alert>
    </div>
  );
}
