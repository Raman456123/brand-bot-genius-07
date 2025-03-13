
import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInfluencerController } from "@/lib/ai-influencer/controller";
import { Terminal, Settings, Activity, Info, User } from "lucide-react";
import { ActivityLogs } from "@/components/ai-influencer/ActivityLogs";
import { ApiKeyManager } from "@/components/ai-influencer/ApiKeyManager";
import { Personality, AIInfluencerProfile, ChatMessage } from "@/lib/ai-influencer/types";
import { InfluencerControls } from "@/components/ai-influencer/InfluencerControls";
import { DashboardPanel } from "@/components/ai-influencer/DashboardPanel";
import { PersonalityForm } from "@/components/ai-influencer/PersonalityForm";
import { AboutPippin } from "@/components/ai-influencer/AboutPippin";

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
          
          <InfluencerControls
            isRunning={isRunning}
            onActivate={handleActivate}
            onRunSingleActivity={handleRunSingleActivity}
            onClearLogs={handleClearLogs}
          />
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
          
          <TabsContent value="dashboard">
            <DashboardPanel
              logs={logs}
              isRunning={isRunning}
              currentActivity={currentActivity}
              brainState={brainState}
              logsEndRef={logsEndRef}
            />
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
          
          <TabsContent value="personality">
            <PersonalityForm
              personality={personality}
              setPersonality={setPersonality}
              primaryObjective={primaryObjective}
              setPrimaryObjective={setPrimaryObjective}
              backstoryOrigin={backstoryOrigin}
              setBackstoryOrigin={setBackstoryOrigin}
              backstoryPurpose={backstoryPurpose}
              setBackstoryPurpose={setBackstoryPurpose}
              coreValues={coreValues}
              setCoreValues={setCoreValues}
              favTopics={favTopics}
              setFavTopics={setFavTopics}
              onSaveProfile={handleSaveProfile}
            />
          </TabsContent>
          
          <TabsContent value="about">
            <AboutPippin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
