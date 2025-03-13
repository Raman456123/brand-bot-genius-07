
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const TestAI = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleTest = async () => {
    // This function will be implemented once we receive and understand Pippin's code
    setIsRunning(true);
    setLogs(prev => [...prev, "Starting AI influencer test..."]);
    
    // Placeholder for actual implementation
    setTimeout(() => {
      setLogs(prev => [...prev, "AI influencer brain not yet implemented. Waiting for code integration..."]);
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Influencer Brain - Test Interface</h1>
        
        <div className="grid gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Run Influencer Brain</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This interface will allow you to test the AI influencer brain functionality once Pippin's code has been integrated.
            </p>
            <Button 
              onClick={handleTest}
              disabled={isRunning}
              className="w-full md:w-auto"
            >
              {isRunning ? "Running Test..." : "Test Influencer Brain"}
            </Button>
          </Card>
        </div>

        <Card className="p-6">
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
      </div>
    </div>
  );
};

export default TestAI;
