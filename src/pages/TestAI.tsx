import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInfluencerController } from "@/lib/ai-influencer/controller";
import { Activity, Integration, ActivityResult } from "@/lib/ai-influencer/types";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const TestAI = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activities, setActivities] = useState<{name: string, status: string, requiredApiKeys?: string[]}[]>([]);
  const [brainState, setBrainState] = useState({
    energy: 1.0,
    mood: "neutral",
    lastActivity: "none"
  });
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, Record<string, boolean>>>({});
  const [autoRun, setAutoRun] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChattingLoading, setIsChattingLoading] = useState(false);
  const controllerRef = useRef<AIInfluencerController | null>(null);

  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new AIInfluencerController();
      
      controllerRef.current.on('log', (message: string) => {
        addLog(message);
      });
      
      controllerRef.current.on('activityCompleted', (result: ActivityResult, activityName: string) => {
        const newEnergy = controllerRef.current?.getBrain().getState().energy || 0;
        
        setActivities(prev => prev.map(a => 
          a.name === activityName 
            ? { ...a, status: "completed (on cooldown)" } 
            : a
        ));
        
        setBrainState(prev => ({
          ...prev,
          energy: newEnergy,
          lastActivity: activityName
        }));
      });
      
      controllerRef.current.on('stateChanged', (state) => {
        setBrainState(prev => ({
          ...prev,
          energy: state.energy,
          mood: state.mood
        }));
      });
      
      const availableActivities = controllerRef.current.getBrain().getAvailableActivities();
      setActivities(availableActivities.map(a => ({ 
        name: a.name, 
        status: "available",
        requiredApiKeys: a.requiredApiKeys 
      })));
      
      setIntegrations(controllerRef.current.getBrain().getAvailableIntegrations());
      
      updateApiKeyStatuses();
    }
  }, []);

  useEffect(() => {
    if (autoRun && !isRunning && controllerRef.current) {
      controllerRef.current.start(10000);
      setIsRunning(true);
    } else if (!autoRun && isRunning && controllerRef.current) {
      controllerRef.current.stop();
      setIsRunning(false);
    }
  }, [autoRun, isRunning]);

  const updateApiKeyStatuses = async () => {
    if (controllerRef.current) {
      const brain = controllerRef.current.getBrain();
      const statuses = await brain.getApiKeyStatuses();
      setApiKeyStatuses(statuses);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleTest = async () => {
    if (!controllerRef.current) return;
    
    setIsRunning(true);
    addLog("Starting AI influencer test...");
    
    try {
      const brain = controllerRef.current.getBrain();
      const availableActivities = brain.getAvailableActivities();
      setActivities(availableActivities.map(a => ({ 
        name: a.name, 
        status: "available",
        requiredApiKeys: a.requiredApiKeys 
      })));
      
      await controllerRef.current.runActivityCycle();
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSetApiKey = async () => {
    if (!controllerRef.current || !selectedActivity || !apiKeyName || !apiKeyValue) {
      addLog("Cannot set API key: missing required information");
      return;
    }
    
    const brain = controllerRef.current.getBrain();
    const success = await brain.setApiKey(selectedActivity, apiKeyName, apiKeyValue);
    
    if (success) {
      addLog(`Successfully set API key "${apiKeyName}" for ${selectedActivity}`);
      setApiKeyValue("");
      
      updateApiKeyStatuses();
    } else {
      addLog(`Failed to set API key "${apiKeyName}" for ${selectedActivity}`);
    }
  };

  const handleExecuteSpecificActivity = async (activityName: string) => {
    if (!controllerRef.current) return;
    
    addLog(`Manually executing ${activityName}...`);
    await controllerRef.current.executeActivity(activityName);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || !controllerRef.current) return;
    
    setIsChattingLoading(true);
    setChatResponse("");
    addLog(`Sending chat prompt: "${chatPrompt}"`);
    
    try {
      const result = await controllerRef.current.executeActivity("chat", {
        prompt: chatPrompt,
        systemPrompt: "You are an AI influencer assistant. Be helpful, concise, and friendly."
      });
      
      if (result.success && result.data) {
        setChatResponse(result.data.content);
        addLog(`Chat response received from model: ${result.data.model}`);
      } else {
        setChatResponse(`Error: ${result.error || "Unknown error occurred"}`);
        addLog(`Chat error: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setChatResponse(`Error: ${errorMessage}`);
      addLog(`Chat exception: ${errorMessage}`);
    } finally {
      setIsChattingLoading(false);
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
            
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="auto-run" 
                checked={autoRun} 
                onCheckedChange={setAutoRun}
              />
              <Label htmlFor="auto-run">Auto-run activities</Label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleTest}
                disabled={isRunning}
                className="w-full sm:w-auto"
              >
                {isRunning ? "Running Test..." : "Test Single Activity"}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Configure API Keys
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Configure API Keys</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="activities">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="activities">Activities</TabsTrigger>
                      <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="activities" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="activity">Select Activity</Label>
                        <select
                          id="activity"
                          className="w-full p-2 border rounded-md"
                          value={selectedActivity || ""}
                          onChange={(e) => setSelectedActivity(e.target.value)}
                        >
                          <option value="">-- Select Activity --</option>
                          {activities.filter(a => a.requiredApiKeys && a.requiredApiKeys.length > 0).map((activity, i) => (
                            <option key={i} value={activity.name}>
                              {activity.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedActivity && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="apiKeyName">API Key Name</Label>
                            <Input
                              id="apiKeyName"
                              value={apiKeyName}
                              onChange={(e) => setApiKeyName(e.target.value)}
                              placeholder="e.g., trendsapi"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="apiKeyValue">API Key Value</Label>
                            <Input
                              id="apiKeyValue"
                              value={apiKeyValue}
                              onChange={(e) => setApiKeyValue(e.target.value)}
                              placeholder="Enter API key value"
                              type="password"
                            />
                          </div>
                          <Button 
                            onClick={handleSetApiKey}
                            disabled={!apiKeyName || !apiKeyValue}
                            className="w-full"
                          >
                            Save API Key
                          </Button>
                        </>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="integrations" className="space-y-4">
                      <ScrollArea className="h-[300px] border rounded-md p-4">
                        {integrations.length > 0 ? (
                          <ul className="space-y-4">
                            {integrations.map((integration, i) => (
                              <li key={i} className="p-3 border rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-semibold">{integration.displayName}</h3>
                                  <span className={`text-sm px-2 py-1 rounded-full ${
                                    integration.connected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {integration.connected ? "Connected" : "Not Connected"}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                  Authentication methods: {integration.authModes.join(", ")}
                                </div>
                                {integration.authModes.includes("API_KEY") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => {
                                      setSelectedActivity(integration.name);
                                      setApiKeyName("api_key");
                                    }}
                                  >
                                    Configure API Key
                                  </Button>
                                )}
                                {integration.authModes.includes("OAUTH2") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2"
                                    disabled
                                  >
                                    Connect via OAuth (Coming Soon)
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-gray-500 italic">No integrations available</div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
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
            
            {Object.keys(apiKeyStatuses).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">API Key Status</h3>
                <div className="space-y-2">
                  {Object.entries(apiKeyStatuses).map(([activity, keys]) => (
                    <div key={activity} className="text-sm">
                      <span className="font-medium">{activity}:</span>
                      <ul className="ml-2">
                        {Object.entries(keys).map(([key, exists]) => (
                          <li key={key} className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {key} {exists ? '✓' : '✗'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Test Chat Activity</h2>
            <form onSubmit={handleChatSubmit} className="space-y-4">
              <div>
                <Label htmlFor="chat-prompt">Enter prompt</Label>
                <Textarea
                  id="chat-prompt"
                  placeholder="Type your message here..."
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" disabled={isChattingLoading || !chatPrompt.trim()}>
                {isChattingLoading ? "Sending..." : "Send Message"}
              </Button>
            </form>
            
            {chatResponse && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium mb-2">Response:</h3>
                <p className="whitespace-pre-wrap">{chatResponse}</p>
              </div>
            )}
            
            {!apiKeyStatuses["chat"]?.["OPENAI"] && (
              <Alert className="mt-4">
                <AlertTitle>API Key Required</AlertTitle>
                <AlertDescription>
                  You need to set an OpenAI API key to use the chat activity. Click "Configure API Keys" 
                  to add your key.
                </AlertDescription>
              </Alert>
            )}
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
                      {activity.requiredApiKeys && activity.requiredApiKeys.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Required API keys: {activity.requiredApiKeys.join(", ")}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleExecuteSpecificActivity(activity.name)}
                      >
                        Execute Now
                      </Button>
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
        </div>
      </div>
    </div>
  );
};

export default TestAI;
