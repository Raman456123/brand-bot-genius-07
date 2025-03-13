
import { Brain, MessageSquare, Image, Zap, Users, ShieldCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
    <div className="w-12 h-12 rounded-xl bg-primary-foreground flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="container px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Introducing the Future of Brand Representation</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our AI influencers combine cutting-edge artificial intelligence with your brand voice to create authentic connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-blue-600" />}
            title="Advanced AI Brain"
            description="Powered by sophisticated algorithms that allow your virtual influencer to think, learn, and adapt like a real person."
          />
          
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
            title="Authentic Engagement"
            description="Responds to comments, messages, and mentions in your brand voice, building genuine connections with your audience."
          />
          
          <FeatureCard
            icon={<Image className="w-6 h-6 text-pink-600" />}
            title="Content Creation"
            description="Generates photos, videos, and posts that align perfectly with your brand guidelines and marketing objectives."
          />
          
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            title="24/7 Availability"
            description="Always online and ready to engage, ensuring your brand never misses an opportunity to connect with your audience."
          />
          
          <FeatureCard
            icon={<Users className="w-6 h-6 text-green-600" />}
            title="Audience Growth"
            description="Strategically expands your reach by engaging with potential customers and building a dedicated following."
          />
          
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-red-600" />}
            title="Brand Safety"
            description="Advanced content filters ensure your virtual influencer always represents your brand appropriately."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
