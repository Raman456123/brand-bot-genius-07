
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, XCircle, Info } from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  timestamp: string;
  activity_type: string;
  success: boolean;
  error: string | null;
  data: any;
  level?: 'info' | 'error' | 'warning' | 'debug';
}

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export function ActivityLogs({ logs }: ActivityLogsProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "HH:mm:ss");
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <ScrollArea className="h-[400px] border rounded-md p-4 bg-black text-green-400 font-mono text-sm">
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <div key={index} className="py-1">
            <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>{" "}
            {log.level === 'info' ? (
              <span className="text-blue-400">INFO:</span>
            ) : log.level === 'error' ? (
              <span className="text-red-400">ERROR:</span>
            ) : log.level === 'warning' ? (
              <span className="text-yellow-400">WARNING:</span>
            ) : null}{" "}
            <span className="font-bold">{log.activity_type}</span>:{" "}
            {log.activity_type.includes("Starting") || log.activity_type.includes("Initializing") ? (
              <span className="text-blue-400 flex items-center gap-1">
                <Info className="h-3 w-3 inline" /> {log.data?.message || "In progress"}
              </span>
            ) : log.success ? (
              <span className="text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3 inline" /> Success
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3 inline" /> Failed: {log.error}
              </span>
            )}
            {log.data && Object.keys(log.data).length > 0 && (
              <div className="ml-5 text-gray-400 text-xs overflow-auto max-h-32">
                {typeof log.data === 'string' ? (
                  log.data
                ) : (
                  <>Data: {JSON.stringify(log.data, null, 2)}</>
                )}
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
