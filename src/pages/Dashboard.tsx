
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft, Settings, User, MessageSquare, ImageIcon, BarChart2, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <Button size="sm" variant="outline" className="gap-1">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Active Influencers</h3>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">2</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">of 3 available</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Engagement Rate</h3>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">4.7%</p>
            <p className="text-green-600 dark:text-green-400 text-sm mt-1">+0.8% from last week</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Content Created</h3>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">38</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">this month</p>
          </div>
        </div>
        
        {/* Influencer list section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your AI Influencers</h2>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              <span>New Influencer</span>
            </Button>
          </div>
          
          <div className="p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                <InfluencerItem 
                  name="Alex Johnson"
                  avatar="/placeholder.svg"
                  role="Tech Specialist"
                  status="active"
                  platforms={["Instagram", "Twitter", "TikTok"]}
                  engagementRate={5.2}
                  lastPost="2 hours ago"
                />
                
                <InfluencerItem 
                  name="Sophia Chen"
                  avatar="/placeholder.svg"
                  role="Lifestyle Guru"
                  status="active"
                  platforms={["Instagram", "Pinterest"]}
                  engagementRate={4.1}
                  lastPost="Yesterday"
                />
                
                <div className="p-6 flex items-center justify-center">
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Another Influencer</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Analytics section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold">Analytics</h2>
          </div>
          
          <div className="p-6">
            <Tabs defaultValue="engagement">
              <TabsList className="mb-6">
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="engagement" className="mt-0">
                <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                  <div className="text-center">
                    <BarChart2 className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">Engagement analytics visualization</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track how your audience is interacting with your AI influencers' content across different platforms.
                </p>
              </TabsContent>
              
              <TabsContent value="growth" className="mt-0">
                <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                  <div className="text-center">
                    <BarChart2 className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">Audience growth visualization</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monitor follower growth and audience expansion driven by your AI influencers.
                </p>
              </TabsContent>
              
              <TabsContent value="content" className="mt-0">
                <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                  <div className="text-center">
                    <BarChart2 className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">Content performance visualization</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analyze which types of content are performing best with your target audience.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

interface InfluencerItemProps {
  name: string;
  avatar: string;
  role: string;
  status: 'active' | 'paused' | 'draft';
  platforms: string[];
  engagementRate: number;
  lastPost: string;
}

const InfluencerItem = ({ 
  name, 
  avatar, 
  role, 
  status, 
  platforms, 
  engagementRate, 
  lastPost 
}: InfluencerItemProps) => {
  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={avatar} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-800"
          />
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
            status === 'active' ? 'bg-green-500' : status === 'paused' ? 'bg-amber-500' : 'bg-gray-400'
          }`}></span>
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platforms</p>
          <div className="flex gap-1">
            {platforms.map(platform => (
              <span 
                key={platform}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Engagement</p>
          <p className="font-medium">{engagementRate}%</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Post</p>
          <p className="font-medium">{lastPost}</p>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800/30">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
