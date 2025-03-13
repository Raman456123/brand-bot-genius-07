
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-900"></div>
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -right-10 top-1/3 h-80 w-80 rounded-full bg-purple-100 blur-3xl"></div>
          <div className="absolute -left-10 top-1/4 h-64 w-64 rounded-full bg-blue-100 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 h-96 w-96 rounded-full bg-pink-100 blur-3xl"></div>
        </div>
      </div>

      <div className="container px-8 mx-auto grid gap-12 lg:grid-cols-2 pt-24 pb-12 items-center">
        <div className="flex flex-col max-w-3xl space-y-8 animate-fade-up">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl text-balance">
              Create AI Influencers <br />
              <span className="text-balance bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">That Drive Results</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-xl text-balance">
              Harness the power of autonomous AI to build virtual brand ambassadors that engage with your audience 24/7.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="px-8 rounded-full">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-3xl font-bold">1M+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Engagements</p>
            </div>
            <div>
              <p className="text-3xl font-bold">300+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brands</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Availability</p>
            </div>
          </div>
        </div>

        <div className="relative aspect-square max-w-lg mx-auto w-full animate-fade-in">
          <div className="absolute inset-0 rounded-2xl overflow-hidden border shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-blue-50/80 to-transparent dark:from-blue-950/30"></div>
            
            <div className="relative h-full w-full flex items-center justify-center">
              <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse-slow">
                  <span className="text-white text-2xl font-bold">Ai</span>
                </div>
                
                <div className="space-y-6 text-center">
                  <h3 className="text-2xl font-semibold">Meet Your Virtual Influencer</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    Fully autonomous, always on-brand, and constantly engaging with your audience.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium dark:bg-blue-900 dark:text-blue-200">
                    Social Media
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium dark:bg-purple-900 dark:text-purple-200">
                    Content Creation
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium dark:bg-pink-900 dark:text-pink-200">
                    Comment Engagement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleScrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors animate-fade-in"
      >
        <span className="text-sm font-medium">Learn More</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
};

export default Hero;
