
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ApiKeyManagerProps {
  apiKeyStatuses: Record<string, Record<string, boolean>>;
  onSetApiKey: (activityName: string, keyName: string, keyValue: string) => Promise<void>;
}

export function ApiKeyManager({ apiKeyStatuses, onSetApiKey }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>({});
  
  const handleApiKeyChange = (activityName: string, keyName: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [activityName]: {
        ...(prev[activityName] || {}),
        [keyName]: value
      }
    }));
  };
  
  const handleSaveApiKey = async (activityName: string, keyName: string) => {
    const keyValue = apiKeys[activityName]?.[keyName];
    if (keyValue) {
      await onSetApiKey(activityName, keyName, keyValue);
      // Clear input after saving
      handleApiKeyChange(activityName, keyName, "");
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Key Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(apiKeyStatuses).map(([activityName, keys]) => (
            <div key={activityName} className="border p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2 capitalize">{activityName.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <div className="space-y-3">
                {Object.entries(keys).map(([keyName, isConfigured]) => (
                  <div key={keyName} className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${activityName}-${keyName}`} className="flex items-center gap-2">
                        {keyName}
                        {isConfigured ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id={`${activityName}-${keyName}`}
                        type="password"
                        placeholder={isConfigured ? "••••••••" : "Enter API key"}
                        value={apiKeys[activityName]?.[keyName] || ""}
                        onChange={(e) => handleApiKeyChange(activityName, keyName, e.target.value)}
                      />
                      <Button 
                        onClick={() => handleSaveApiKey(activityName, keyName)}
                        disabled={!apiKeys[activityName]?.[keyName]}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
