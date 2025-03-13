import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInfluencerController } from "@/lib/ai-influencer/controller";
import { Play, Pause, RotateCcw, Terminal, Settings, Activity, Info, User } from "lucide-react";
import { ActivityLogs } from "@/components/ai-influencer/ActivityLogs";
import { ApiKeyManager } from "@/components/ai-influencer/ApiKeyManager";
import { AIInfluencerProfile, Personality } from "@/lib/ai-influencer/types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ActivityLog {
  timestamp: string;
  activity_type: string;
  success: boolean;
  error: string | null;
  data: any;
}

export default function Influencer() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [brainState, setBrainState] = useState({
    energy: 1.0,
    mood: "neutral",
    lastActivity: "None"
  });
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, Record<string, boolean>>>({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [personality, setPersonality] = useState<Personality>({
    friendliness: 0.8,
    creativity: 0.7,
    curiosity: 0.9,
    empathy: 0.75,
    humor: 0.6,
    formality: 0.5,
    emotional_stability: 0.8
  });
  const [primaryObjective, setPrimaryObjective] = useState("Spread positivity");
  const [backstoryOrigin, setBackstoryOrigin] = useState("Created as a digital companion to assist and engage with humans");
  const [backstoryPurpose, setBackstoryPurpose] = useState("To help humans learn, grow, and achieve their goals while providing meaningful interaction");
  const [coreValues, setCoreValues] = useState("knowledge,helpfulness,ethical behavior,growth");
  const [favTopics, setFavTopics] = useState("technology,art,science");
  
  const controllerRef = useRef<AIInfluencerController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize controller on component mount
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new AIInfluencerController();
      
      // Set up event listeners
      controllerRef.current.on('log', (message: string) => {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          activity_type: "System",
          success: true,
          error: null,
          data: { message }
        }]);
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
        
        // Update personality state if available
        if (state.personality) {
          setPersonality(state.personality);
        }
        
        // Update other profile-related states if available
        if (state.objectives?.primary) {
          setPrimaryObjective(state.objectives.primary);
        }
        
        if (state.backstory) {
          setBackstoryOrigin(state.backstory.origin);
          setBackstoryPurpose(state.backstory.purpose);
          setCoreValues(state.backstory.core_values.join(','));
        }
        
        if (state.preferences?.favorite_topics) {
          setFavTopics(state.preferences.favorite_topics.join(','));
        }
      });
      
      controllerRef.current.on('activityCompleted', (result, activityName) => {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          activity_type: activityName,
          success: result.success,
          error: result.error,
          data: result.data
        }]);
      });

      // Load API key statuses
      loadApiKeyStatuses();
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

  const loadApiKeyStatuses = async () => {
    if (!controllerRef.current) return;
    
    try {
      const statuses = await controllerRef.current.getBrain().getApiKeyStatuses();
      setApiKeyStatuses(statuses);
    } catch (error) {
      console.error("Failed to load API key statuses:", error);
    }
  };

  const handleSetApiKey = async (activityName: string, keyName: string, keyValue: string) => {
    if (!controllerRef.current) return;
    
    try {
      await controllerRef.current.getBrain().setApiKey(activityName, keyName, keyValue);
      await loadApiKeyStatuses();
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        activity_type: "Config",
        success: true,
        error: null,
        data: { message: `API key ${keyName} for ${activityName} was updated` }
      }]);
    } catch (error) {
      console.error("Failed to set API key:", error);
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        activity_type: "Config",
        success: false,
        error: `Failed to set API key: ${error}`,
        data: null
      }]);
    }
  };

  const handleActivate = () => {
    if (!controllerRef.current) return;
    
    if (!isRunning) {
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        activity_type: "System",
        success: true,
        error: null,
        data: { message: "🚀 Activating AI Influencer..." }
      }]);
      controllerRef.current.start(5000); // 5 second interval between activities
      setIsRunning(true);
    } else {
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        activity_type: "System",
        success: true,
        error: null,
        data: { message: "⏸️ Deactivating AI Influencer..." }
      }]);
      controllerRef.current.stop();
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleRunSingleActivity = async () => {
    if (!controllerRef.current) return;
    
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      activity_type: "System",
      success: true,
      error: null,
      data: { message: "▶️ Running a single activity cycle..." }
    }]);
    await controllerRef.current.runActivityCycle();
  };

  const handleSaveProfile = () => {
    if (!controllerRef.current) return;
    
    // Create profile object from current state
    const profile: AIInfluencerProfile = {
      name: "Pippin",
      version: "1.0.0",
      personality: personality,
      communication_style: {
        tone: {
          casual: 0.7,
          professional: 0.3,
          playful: 0.6,
          serious: 0.4
        },
        verbosity: 0.6,
        response_style: {
          analytical: 0.7,
          emotional: 0.6,
          practical: 0.8
        },
        language_preferences: {
          technical_level: 0.6,
          metaphor_usage: 0.4,
          jargon_tolerance: 0.5
        }
      },
      backstory: {
        origin: backstoryOrigin,
        purpose: backstoryPurpose,
        core_values: coreValues.split(',').map(v => v.trim()),
        significant_experiences: []
      },
      objectives: {
        primary: primaryObjective
      },
      knowledge_domains: {
        technology: 0.9,
        art: 0.7,
        science: 0.8,
        philosophy: 0.6,
        current_events: 0.7
      },
      preferences: {
        favorite_topics: favTopics.split(',').map(t => t.trim()),
        activity_frequency: {
          social: 0.6,
          creative: 0.4,
          analytical: 0.7
        }
      },
      constraints: {
        max_activities_per_hour: 10,
        rest_period_minutes: 15,
        interaction_limits: {
          max_conversation_length: 120,
          response_time_target: 5
        }
      },
      setup_complete: true
    };
    
    // Load profile into brain
    controllerRef.current.getBrain().loadProfile(profile);
    
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      activity_type: "Config",
      success: true,
      error: null,
      data: { message: "🧠 Updated AI influencer profile and personality" }
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Configuration
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Personality
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" /> About Pippin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
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
            </div>
            
            <Alert>
              <AlertDescription>
                The AI Influencer's activities simulate actions based on the Pippin framework. Configure API keys in the Configuration tab.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="config">
            <ApiKeyManager 
              apiKeyStatuses={apiKeyStatuses}
              onSetApiKey={handleSetApiKey}
            />
            
            <Alert className="mb-6">
              <AlertDescription>
                Set up the required API keys to enable various activities. The AI Influencer needs at least one LLM API key to function properly.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="personality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personality Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personality Traits</h3>
                  
                  <div className="space-y-6">
                    {Object.entries(personality).map(([trait, value]) => (
                      <div key={trait} className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor={trait} className="capitalize">
                            {trait.replace(/_/g, ' ')}
                          </Label>
                          <span className="text-sm">{(value * 10).toFixed(1)}/10</span>
                        </div>
                        <Slider
                          id={trait}
                          value={[value * 10]}
                          min={0}
                          max={10}
                          step={0.1}
                          onValueChange={(values) => {
                            const newValue = values[0] / 10;
                            setPersonality(prev => ({
                              ...prev,
                              [trait]: newValue
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Objectives</h3>
                  <div className="space-y-2">
                    <Label htmlFor="primary-objective">Primary Objective</Label>
                    <Input
                      id="primary-objective"
                      value={primaryObjective}
                      onChange={(e) => setPrimaryObjective(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backstory</h3>
                  <div className="space-y-2">
                    <Label htmlFor="backstory-origin">Origin</Label>
                    <Textarea
                      id="backstory-origin"
                      value={backstoryOrigin}
                      onChange={(e) => setBackstoryOrigin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backstory-purpose">Purpose</Label>
                    <Textarea
                      id="backstory-purpose"
                      value={backstoryPurpose}
                      onChange={(e) => setBackstoryPurpose(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="core-values">Core Values (comma-separated)</Label>
                    <Input
                      id="core-values"
                      value={coreValues}
                      onChange={(e) => setCoreValues(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferences</h3>
                  <div className="space-y-2">
                    <Label htmlFor="favorite-topics">Favorite Topics (comma-separated)</Label>
                    <Input
                      id="favorite-topics"
                      value={favTopics}
                      onChange={(e) => setFavTopics(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveProfile}>Save Personality Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Pippin AI Framework</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  <strong>Pippin</strong> is a flexible, open-source framework to create a digital "being" that learns 
                  about your goals, connects to various tools or APIs, dynamically creates and tests new "Activities" 
                  in pursuit of your objectives, and manages a memory system to track past actions and outcomes.
                </p>
                
                <h3>Key Features</h3>
                <ul>
                  <li><strong>Self-Improving:</strong> The AI can suggest and implement new activities</li>
                  <li><strong>Multiple LLM Support:</strong> Use OpenAI, GPT4All, or custom providers</li>
                  <li><strong>Memory System:</strong> Short and long-term memory of activities and results</li>
                  <li><strong>API Integrations:</strong> Connect to external services and tools</li>
                  <li><strong>Activity Framework:</strong> Pre-built activities with constraint management</li>
                </ul>
                
                <p>
                  This implementation is a web-based version inspired by the Pippin framework, adapted to run in a 
                  browser environment using TypeScript and React.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
