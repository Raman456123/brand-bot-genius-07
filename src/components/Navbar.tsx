
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 glass-effect backdrop-blur-xl border-b'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-semibold flex items-center gap-2 transition-opacity duration-300 hover:opacity-80"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white">
            Ai
          </span>
          <span className="font-medium">Influenxa</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#how-it-works">How it Works</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </nav>
        
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-full px-4 transition-all duration-300">
            Sign In
          </Button>
          <Button size="sm" className="rounded-full px-4 hover:shadow-lg transition-all duration-300">
            Get Started
          </Button>
        </div>
        
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-effect backdrop-blur-xl border-b">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-3">
            <MobileNavLink href="/#features" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </MobileNavLink>
            <MobileNavLink href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
              How it Works
            </MobileNavLink>
            <MobileNavLink href="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </MobileNavLink>
            <MobileNavLink href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard
            </MobileNavLink>
            <div className="flex flex-col gap-2 pt-3 border-t">
              <Button variant="outline" className="w-full justify-center rounded-full">
                Sign In
              </Button>
              <Button className="w-full justify-center rounded-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
  >
    {children}
  </a>
);

const MobileNavLink = ({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="px-1 py-2 text-base font-medium border-b border-gray-100 dark:border-gray-800 last:border-0"
    onClick={onClick}
  >
    {children}
  </a>
);

export default Navbar;
