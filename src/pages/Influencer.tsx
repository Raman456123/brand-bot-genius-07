
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AIInfluencerController } from "@/lib/ai-influencer/controller";
import { Play, Pause, RotateCcw, Terminal } from "lucide-react";

export default function Influencer() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [brainState, setBrainState] = useState({
    energy: 1.0,
    mood: "neutral",
    lastActivity: "None"
  });
  
  const controllerRef = useRef<AIInfluencerController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize controller on component mount
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new AIInfluencerController();
      
      // Set up event listeners
      controllerRef.current.on('log', (message: string) => {
        setLogs(prev => [...prev, message]);
      });
      
      controllerRef.current.on('activitySelected', (activity) => {
        setCurrentActivity(activity.name);
      });
      
      controllerRef.current.on('stateChanged', (state) => {
        setBrainState({
          energy: state.energy,
          mood: state.mood || "neutral",
          lastActivity: state.lastActivity || "None"
        });
      });
    }
    
    return () => {
      // Stop the influencer when component unmounts
      if (controllerRef.current && isRunning) {
        controllerRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleActivate = () => {
    if (!controllerRef.current) return;
    
    if (!isRunning) {
      setLogs(prev => [...prev, "🚀 Activating AI Influencer..."]);
      controllerRef.current.start(5000); // 5 second interval between activities
      setIsRunning(true);
    } else {
      setLogs(prev => [...prev, "⏸️ Deactivating AI Influencer..."]);
      controllerRef.current.stop();
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleRunSingleActivity = async () => {
    if (!controllerRef.current) return;
    
    setLogs(prev => [...prev, "▶️ Running a single activity cycle..."]);
    await controllerRef.current.runActivityCycle();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pippin AI Influencer</h1>
          
          <div className="flex gap-2">
            <Button
              onClick={handleActivate}
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
              onClick={handleRunSingleActivity} 
              variant="outline"
              disabled={isRunning}
            >
              Run Once
            </Button>
            
            <Button 
              onClick={handleClearLogs} 
              variant="ghost"
              size="icon"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-5 w-5" />
              <h2 className="text-xl font-semibold">System Logs</h2>
            </div>
            
            <ScrollArea className="h-[400px] border rounded-md p-4 bg-black text-green-400 font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="py-1">
                    <span className="text-gray-500">[{new Date().toISOString()}]</span> {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No logs yet. Activate the influencer to see output here.
                </div>
              )}
              <div ref={logsEndRef} />
            </ScrollArea>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI State</h2>
            
            <div className="space-y-4">
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
            </div>
            
            <Alert className="mt-6">
              <AlertDescription>
                The AI Influencer's activities simulate real API calls. API keys for Twitter, OpenAI, etc. can be configured in the settings panel.
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    </div>
  );
}
