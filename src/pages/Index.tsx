
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        
        {/* Pricing section */}
        <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-950">
          <div className="container px-8 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Choose the plan that fits your brand's needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold mb-1">Starter</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">For small brands</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>1 AI Influencer</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Basic content creation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>3 social platforms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Standard analytics</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-full">Get Started</Button>
                </div>
              </div>
              
              {/* Professional Plan */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-500 dark:border-blue-600 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] -translate-y-4">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-2">
                    Popular
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Professional</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">For growing brands</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$249</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>3 AI Influencers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Advanced content creation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>All social platforms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full rounded-full">Get Started</Button>
                </div>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">For large brands</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Unlimited AI Influencers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Premium content creation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-full">Contact Sales</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-24">
          <div className="container px-8 mx-auto">
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Brand Presence?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the AI revolution and create virtual brand ambassadors that work 24/7 to grow your audience and drive conversions.
              </p>
              <Button size="lg" className="rounded-full px-8 py-6 text-lg flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 bg-gray-50 dark:bg-gray-950">
        <div className="container px-8 mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-xl font-semibold flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white dark:from-white dark:to-gray-300 dark:text-black">
                  Ai
                </span>
                <span className="font-medium">Influenxa</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Creating autonomous AI influencers that drive results for forward-thinking brands.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">How It Works</a></li>
                <li><a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Influenxa. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
