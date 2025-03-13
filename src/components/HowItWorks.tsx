
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <section id="how-it-works" className="py-24">
      <div className="container px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Create, train, and deploy your AI influencer in three simple steps.
          </p>
        </div>

        <Tabs defaultValue="create" className="max-w-5xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="create" className="text-base py-3">1. Create</TabsTrigger>
            <TabsTrigger value="train" className="text-base py-3">2. Train</TabsTrigger>
            <TabsTrigger value="deploy" className="text-base py-3">3. Deploy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-0">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-semibold mb-4">Design Your Perfect AI Influencer</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start by creating the visual identity and personality of your virtual brand ambassador. Choose their appearance, voice, and demographic attributes to connect with your target audience.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Customize appearance and demographic details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Define personality traits and communication style</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Set initial interests and expertise areas</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <span className="text-white text-2xl font-bold">Ai</span>
                    </div>
                    <p className="text-xl font-medium">Your AI Influencer</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                      <p className="font-medium">Alex Johnson</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Personality</label>
                      <p className="font-medium">Friendly, Knowledgeable, Approachable</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Interests</label>
                      <p className="font-medium">Technology, Fitness, Sustainable Living</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="train" className="mt-0">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-semibold mb-4">Train Your AI with Your Brand Knowledge</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upload your brand guidelines, product information, marketing materials, and content examples to train your AI influencer on your unique brand voice and expertise.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Import brand guidelines and marketing materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Add product details and technical specifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Set content preferences and engagement policies</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="font-semibold">Knowledge Base Configuration</h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-4">
                    <span className="w-4 h-4 rounded-full bg-green-500 mr-3"></span>
                    <span>Brand Guidelines</span>
                    <span className="ml-auto text-xs text-gray-500">Uploaded</span>
                  </div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-4">
                    <span className="w-4 h-4 rounded-full bg-green-500 mr-3"></span>
                    <span>Product Information</span>
                    <span className="ml-auto text-xs text-gray-500">Uploaded</span>
                  </div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-4">
                    <span className="w-4 h-4 rounded-full bg-green-500 mr-3"></span>
                    <span>Content Examples</span>
                    <span className="ml-auto text-xs text-gray-500">Uploaded</span>
                  </div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center px-4">
                    <span className="w-4 h-4 rounded-full bg-blue-500 mr-3"></span>
                    <span>Training in Progress</span>
                    <span className="ml-auto text-xs text-gray-500">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="deploy" className="mt-0">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-semibold mb-4">Deploy and Optimize Your AI Influencer</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect your AI influencer to your social media accounts and set campaign goals. Monitor performance and fine-tune your strategy based on real-time analytics.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Connect to social platforms with secure OAuth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Set posting schedule and engagement parameters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 h-6 w-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">✓</span>
                    <span>Monitor performance and make real-time adjustments</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="font-semibold">Deployment Status</h4>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor" />
                          </svg>
                        </div>
                        <span>Instagram</span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor" />
                          </svg>
                        </div>
                        <span>Twitter</span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor" />
                          </svg>
                        </div>
                        <span>TikTok</span>
                      </div>
                      <span className="text-yellow-600 text-sm font-medium">Pending</span>
                    </div>
                  </div>
                  <Button className="w-full rounded-lg">Launch Campaign</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default HowItWorks;
