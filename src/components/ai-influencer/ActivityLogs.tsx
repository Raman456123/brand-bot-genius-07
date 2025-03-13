
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, XCircle } from "lucide-react";

interface ActivityLog {
  timestamp: string;
  activity_type: string;
  success: boolean;
  error: string | null;
  data: any;
}

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export function ActivityLogs({ logs }: ActivityLogsProps) {
  return (
    <ScrollArea className="h-[400px] border rounded-md p-4 bg-black text-green-400 font-mono text-sm">
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <div key={index} className="py-1">
            <span className="text-gray-500">[{log.timestamp}]</span>{" "}
            <span className="font-bold">{log.activity_type}</span>:{" "}
            {log.success ? (
              <span className="text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3 inline" /> Success
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3 inline" /> Failed: {log.error}
              </span>
            )}
            {log.data && Object.keys(log.data).length > 0 && (
              <div className="ml-5 text-gray-400 text-xs">
                Data: {JSON.stringify(log.data, null, 2)}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-gray-500 dark:text-gray-400 italic">
          No logs yet. Activate the influencer to see output here.
        </div>
      )}
    </ScrollArea>
  );
}
