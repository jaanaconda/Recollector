import { Link, useLocation } from "wouter";
import { Heart, Shield, Menu } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Conversations", icon: "fas fa-comments" },
    { path: "/memories", label: "My Memories", icon: "fas fa-brain" },
    { path: "/photos", label: "Photos", icon: "fas fa-images" },
    { path: "/family", label: "Family Access", icon: "fas fa-users" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-white text-sm" size={16} />
              </div>
              <span className="text-xl font-semibold text-warm-gray">Recollector</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span 
                    className={`transition-colors ${
                      location === item.path
                        ? "text-primary font-medium border-b-2 border-primary pb-1"
                        : "text-soft-gray hover:text-warm-gray"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                <Shield size={12} />
                <span>Secure</span>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
              </div>
            </div>
          </div>

          <button className="md:hidden text-warm-gray" data-testid="button-mobile-menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
