import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInfluencerController } from "@/lib/ai-influencer/controller";
import { Activity, ActivityResult } from "@/lib/ai-influencer/types";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ActivityLogs } from "@/components/ai-influencer/ActivityLogs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const TestAI = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [activities, setActivities] = useState<{name: string, status: string, requiredApiKeys?: string[]}[]>([]);
  const [brainState, setBrainState] = useState({
    energy: 1.0,
    mood: "neutral",
    lastActivity: "none",
    lastActivityTimestamp: null
  });
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, Record<string, boolean>>>({});
  const [autoRun, setAutoRun] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChattingLoading, setIsChattingLoading] = useState(false);
  
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const { toast } = useToast();
  const controllerRef = useRef<AIInfluencerController | null>(null);

  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new AIInfluencerController();
      
      controllerRef.current.on('log', (message: string) => {
        addLog({
          timestamp: new Date().toISOString(),
          activity_type: message,
          success: true,
          error: null,
          data: null,
          level: 'info'
        });
      });
      
      controllerRef.current.on('activityCompleted', (result: ActivityResult, activityName: string) => {
        const newEnergy = controllerRef.current?.getBrain().getState().energy || 0;
        const activityResult = {
          timestamp: new Date().toISOString(),
          activity_type: activityName,
          success: result.success,
          error: result.error,
          data: result.data,
          level: result.success ? 'info' : 'error'
        };
        
        addLog(activityResult);
        
        setActivities(prev => prev.map(a => 
          a.name === activityName 
            ? { ...a, status: "completed (on cooldown)" } 
            : a
        ));
        
        setBrainState(prev => ({
          ...prev,
          energy: newEnergy,
          lastActivity: activityName,
          lastActivityTimestamp: new Date().toISOString()
        }));
        
        if (result.success) {
          toast({
            title: `Activity Completed: ${activityName}`,
            description: `Successfully executed ${activityName}`,
          });
        } else {
          toast({
            title: `Activity Failed: ${activityName}`,
            description: result.error || "Unknown error occurred",
            variant: "destructive"
          });
        }
      });
      
      controllerRef.current.on('activitySelected', (activity: Activity) => {
        addLog({
          timestamp: new Date().toISOString(),
          activity_type: `Selected activity: ${activity.name}`,
          success: true,
          error: null,
          data: null,
          level: 'info'
        });
      });
      
      controllerRef.current.on('stateChanged', (state) => {
        setBrainState(prev => ({
          ...prev,
          energy: state.energy,
          mood: state.mood
        }));
      });
      
      // Load initial activities
      const availableActivities = controllerRef.current.getBrain().getAvailableActivities();
      setActivities(availableActivities.map(a => ({ 
        name: a.name, 
        status: "available",
        requiredApiKeys: a.requiredApiKeys 
      })));
      
      updateApiKeyStatuses();
    }
  }, [toast]);

  useEffect(() => {
    if (autoRun && !isRunning && controllerRef.current) {
      controllerRef.current.start(10000);
      setIsRunning(true);
      
      toast({
        title: "AI Influencer Started",
        description: "The AI will automatically select and run activities",
      });
    } else if (!autoRun && isRunning && controllerRef.current) {
      controllerRef.current.stop();
      setIsRunning(false);
      
      toast({
        title: "AI Influencer Stopped",
        description: "Automatic activity selection has been stopped",
      });
    }
  }, [autoRun, isRunning, toast]);

  const updateApiKeyStatuses = async () => {
    if (controllerRef.current) {
      const brain = controllerRef.current.getBrain();
      const statuses = await brain.getApiKeyStatuses();
      setApiKeyStatuses(statuses);
    }
  };

  const addLog = (logMessage: any) => {
    setLogs(prev => [logMessage, ...prev]);
  };

  const handleTest = async () => {
    if (!controllerRef.current) return;
    
    addLog({
      timestamp: new Date().toISOString(),
      activity_type: "Starting AI influencer test...",
      success: true,
      error: null,
      data: null,
      level: 'info'
    });
    
    try {
      const brain = controllerRef.current.getBrain();
      const availableActivities = brain.getAvailableActivities();
      setActivities(availableActivities.map(a => ({ 
        name: a.name, 
        status: "available",
        requiredApiKeys: a.requiredApiKeys 
      })));
      
      await controllerRef.current.runActivityCycle();
      
      toast({
        title: "Test Complete",
        description: "Successfully ran a single activity cycle",
      });
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        activity_type: "Error running test",
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null,
        level: 'error'
      });
      
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };

  const handleSetApiKey = async () => {
    if (!controllerRef.current || !selectedActivity || !apiKeyName || !apiKeyValue) {
      toast({
        title: "Cannot set API key",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }
    
    const brain = controllerRef.current.getBrain();
    const success = await brain.setApiKey(selectedActivity, apiKeyName, apiKeyValue);
    
    if (success) {
      addLog({
        timestamp: new Date().toISOString(),
        activity_type: `Set API key "${apiKeyName}" for ${selectedActivity}`,
        success: true,
        error: null,
        data: null,
        level: 'info'
      });
      
      setApiKeyValue("");
      
      updateApiKeyStatuses();
      
      toast({
        title: "API Key Saved",
        description: `Successfully set API key "${apiKeyName}" for ${selectedActivity}`
      });
    } else {
      toast({
        title: "Failed to Save API Key",
        description: `Could not set API key "${apiKeyName}" for ${selectedActivity}`,
        variant: "destructive"
      });
    }
  };

  const handleExecuteSpecificActivity = async (activityName: string) => {
    if (!controllerRef.current) return;
    
    addLog({
      timestamp: new Date().toISOString(),
      activity_type: `Manually executing ${activityName}...`,
      success: true,
      error: null,
      data: null,
      level: 'info'
    });
    
    try {
      await controllerRef.current.executeActivity(activityName);
    } catch (error) {
      toast({
        title: `Failed to Execute ${activityName}`,
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || !controllerRef.current) return;
    
    setIsChattingLoading(true);
    setChatResponse("");
    
    addLog({
      timestamp: new Date().toISOString(),
      activity_type: `Sending chat prompt`,
      success: true,
      error: null,
      data: { message: chatPrompt.substring(0, 100) + (chatPrompt.length > 100 ? "..." : "") },
      level: 'info'
    });
    
    try {
      const result = await controllerRef.current.executeActivity("chat", {
        prompt: chatPrompt,
        systemPrompt: "You are an AI influencer assistant. Be helpful, concise, and friendly."
      });
      
      if (result?.success && result.data) {
        setChatResponse(result.data.content);
        
        addLog({
          timestamp: new Date().toISOString(),
          activity_type: `Chat response received`,
          success: true,
          error: null,
          data: { model: result.data.model },
          level: 'info'
        });
      } else {
        setChatResponse(`Error: ${result?.error || "Unknown error occurred"}`);
        
        addLog({
          timestamp: new Date().toISOString(),
          activity_type: `Chat error`,
          success: false,
          error: result?.error || "Unknown error occurred",
          data: null,
          level: 'error'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setChatResponse(`Error: ${errorMessage}`);
      
      addLog({
        timestamp: new Date().toISOString(),
        activity_type: `Chat exception`,
        success: false,
        error: errorMessage,
        data: null,
        level: 'error'
      });
    } finally {
      setIsChattingLoading(false);
    }
  };

  const handleImageGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || !controllerRef.current) return;
    
    setIsGeneratingImage(true);
    setGeneratedImageUrl("");
    
    addLog({
      timestamp: new Date().toISOString(),
      activity_type: `Generating image`,
      success: true,
      error: null,
      data: { prompt: imagePrompt.substring(0, 100) + (imagePrompt.length > 100 ? "..." : "") },
      level: 'info'
    });
    
    try {
      const result = await controllerRef.current.executeActivity("generate_image", {
        prompt: imagePrompt,
        size: "1024x1024",
        format: "png"
      });
      
      if (result?.success && result.data) {
        setGeneratedImageUrl(result.data.url);
        
        addLog({
          timestamp: new Date().toISOString(),
          activity_type: `Image generated`,
          success: true,
          error: null,
          data: { generationId: result.data.generationId },
          level: 'info'
        });
      } else {
        addLog({
          timestamp: new Date().toISOString(),
          activity_type: `Image generation error`,
          success: false,
          error: result?.error || "Unknown error occurred",
          data: null,
          level: 'error'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addLog({
        timestamp: new Date().toISOString(),
        activity_type: `Image generation exception`,
        success: false,
        error: errorMessage,
        data: null,
        level: 'error'
      });
    } finally {
      setIsGeneratingImage(false);
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
              This interface demonstrates a simplified version of the Pippin AI influencer brain
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
                  <div className="space-y-4">
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
                            placeholder="e.g., OPENAI"
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
                  </div>
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
              {brainState.lastActivityTimestamp && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Activity Time:</span>
                  <span className="font-medium">
                    {new Date(brainState.lastActivityTimestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
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
            <Tabs defaultValue="chat">
              <TabsList className="mb-4">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="image">Image Generation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat">
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
              </TabsContent>
              
              <TabsContent value="image">
                <h2 className="text-xl font-semibold mb-4">Test Image Generation</h2>
                <form onSubmit={handleImageGeneration} className="space-y-4">
                  <div>
                    <Label htmlFor="image-prompt">Image Description</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="Describe the image you want to generate..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" disabled={isGeneratingImage || !imagePrompt.trim()}>
                    {isGeneratingImage ? "Generating..." : "Generate Image"}
                  </Button>
                </form>
                
                {generatedImageUrl && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">Generated Image:</h3>
                    <div className="mt-2 flex justify-center">
                      <img 
                        src={generatedImageUrl} 
                        alt="AI generated" 
                        className="max-w-full h-auto rounded-md border border-gray-300"
                      />
                    </div>
                  </div>
                )}
                
                {!apiKeyStatuses["generate_image"]?.["OPENAI"] && (
                  <Alert className="mt-4">
                    <AlertTitle>API Key Required</AlertTitle>
                    <AlertDescription>
                      You need to set an OpenAI API key to use the image generation activity. Click "Configure API Keys" 
                      to add your key.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
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
            <ActivityLogs logs={logs} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestAI;
