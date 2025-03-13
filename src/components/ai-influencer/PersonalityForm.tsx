
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Personality } from "@/lib/ai-influencer/types";

interface PersonalityFormProps {
  personality: Personality;
  setPersonality: (personality: Personality) => void;
  primaryObjective: string;
  setPrimaryObjective: (objective: string) => void;
  backstoryOrigin: string;
  setBackstoryOrigin: (origin: string) => void;
  backstoryPurpose: string;
  setBackstoryPurpose: (purpose: string) => void;
  coreValues: string;
  setCoreValues: (values: string) => void;
  favTopics: string;
  setFavTopics: (topics: string) => void;
  onSaveProfile: () => void;
}

export function PersonalityForm({
  personality,
  setPersonality,
  primaryObjective,
  setPrimaryObjective,
  backstoryOrigin,
  setBackstoryOrigin,
  backstoryPurpose,
  setBackstoryPurpose,
  coreValues,
  setCoreValues,
  favTopics,
  setFavTopics,
  onSaveProfile,
}: PersonalityFormProps) {
  return (
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
        
        <Button onClick={onSaveProfile}>Save Personality Profile</Button>
      </CardContent>
    </Card>
  );
}
