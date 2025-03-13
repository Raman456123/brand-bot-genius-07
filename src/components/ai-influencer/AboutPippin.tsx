
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AboutPippin() {
  return (
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
  );
}
