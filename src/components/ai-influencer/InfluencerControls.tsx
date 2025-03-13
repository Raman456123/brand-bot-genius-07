
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface InfluencerControlsProps {
  isRunning: boolean;
  onActivate: () => void;
  onRunSingleActivity: () => void;
  onClearLogs: () => void;
}

export function InfluencerControls({
  isRunning,
  onActivate,
  onRunSingleActivity,
  onClearLogs,
}: InfluencerControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onActivate}
        variant={isRunning ? "destructive" : "default"}
        className="gap-2"
      >
        {isRunning ? (
          <>
            <Pause className="h-4 w-4" /> Deactivate
          </>
        ) : (
          <>
            <Play className="h-4 w-4" /> Activate
          </>
        )}
      </Button>
      
      <Button 
        onClick={onRunSingleActivity} 
        variant="outline"
        disabled={isRunning}
      >
        Run Once
      </Button>
      
      <Button 
        onClick={onClearLogs} 
        variant="ghost"
        size="icon"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
