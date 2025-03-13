
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AIStateCardProps {
  isRunning: boolean;
  currentActivity: string | null;
  brainState: {
    energy: number;
    mood: string;
    lastActivity: string;
  };
}

export function AIStateCard({ isRunning, currentActivity, brainState }: AIStateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <p className="font-medium">{isRunning ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        
        {currentActivity && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Activity</p>
            <p className="font-medium">{currentActivity}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Energy Level</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${brainState.energy * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">{Math.round(brainState.energy * 100)}%</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Mood</p>
          <p className="font-medium capitalize">{brainState.mood}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Last Activity</p>
          <p className="font-medium">{brainState.lastActivity}</p>
        </div>
      </CardContent>
    </Card>
  );
}
