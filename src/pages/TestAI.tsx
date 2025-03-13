
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AIInfluencerBrain } from "@/lib/ai-influencer/brain";

const TestAI = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activities, setActivities] = useState<{name: string, status: string}[]>([]);
  const [brainState, setBrainState] = useState({
    energy: 1.0,
    mood: "neutral",
    lastActivity: "none"
  });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleTest = async () => {
    setIsRunning(true);
    setActivities([]);
    addLog("Starting AI influencer test...");
    
    try {
      // Initialize the AI brain
      const brain = new AIInfluencerBrain();
      addLog("AI influencer brain initialized");
      
      // Load available activities
      brain.loadActivities();
      const availableActivities = brain.getAvailableActivities();
      setActivities(availableActivities.map(a => ({ 
        name: a.name, 
        status: "available" 
      })));
      addLog(`Loaded ${availableActivities.length} activities`);
      
      // Select and run an activity
      addLog("Selecting next activity based on current state...");
      const nextActivity = brain.selectNextActivity();
      
      if (nextActivity) {
        addLog(`Selected activity: ${nextActivity.name}`);
        addLog(`Energy cost: ${nextActivity.energyCost}`);
        addLog(`Running ${nextActivity.name}...`);
        
        // Simulate the activity execution
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update state after activity
        const newEnergy = Math.max(0, brainState.energy - nextActivity.energyCost);
        addLog(`Activity completed. Energy reduced from ${brainState.energy.toFixed(1)} to ${newEnergy.toFixed(1)}`);
        
        // Update UI
        setBrainState(prev => ({
          ...prev,
          energy: newEnergy,
          lastActivity: nextActivity.name
        }));
        
        // Update activity status
        setActivities(prev => prev.map(a => 
          a.name === nextActivity.name 
            ? { ...a, status: "completed (on cooldown)" } 
            : a
        ));
      } else {
        addLog("No suitable activity found. The AI needs to rest or recover energy.");
      }
      
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Influencer Brain - Test Interface</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Run Influencer Brain</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This interface demonstrates a simplified version of the AI influencer brain
              that selects activities based on state and constraints.
            </p>
            <Button 
              onClick={handleTest}
              disabled={isRunning}
              className="w-full md:w-auto"
            >
              {isRunning ? "Running Test..." : "Test Influencer Brain"}
            </Button>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Energy:</span>
                <span className="font-medium">{brainState.energy.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Mood:</span>
                <span className="font-medium capitalize">{brainState.mood}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Activity:</span>
                <span className="font-medium">{brainState.lastActivity}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">System Logs</h2>
            <ScrollArea className="h-[400px] border rounded-md p-4 bg-black text-green-400 font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="py-1">
                    <span className="text-gray-500">[{new Date().toISOString()}]</span> {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No logs yet. Run the test to see output here.
                </div>
              )}
            </ScrollArea>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Available Activities</h2>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              {activities.length > 0 ? (
                <ul className="space-y-2">
                  {activities.map((activity, index) => (
                    <li key={index} className="p-2 border rounded-md">
                      <div className="font-medium">{activity.name}</div>
                      <div className={`text-sm ${
                        activity.status === "available" 
                          ? "text-green-500" 
                          : "text-amber-500"
                      }`}>
                        {activity.status}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No activities loaded. Run the test to see available activities.
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestAI;
