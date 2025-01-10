import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Beaker, Package, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function SideNav() {
  const location = useLocation();
  const { signOut, loading } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { path: '/my-tests', icon: Beaker, label: 'My Tests' },
    { path: '/all-products', icon: Package, label: 'My Products' },
  ];

  return (
    <div className="w-64 h-full bg-[#00A67E] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#00C495]">
        <Link to="/my-tests" className="flex items-center space-x-2">
          <div className="bg-white p-2 rounded-lg">
            <img 
              src="https://i.imghippo.com/files/QfED5977I.png"
              alt="TestPilot"
              className="h-8"
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#008F6B] text-white'
                    : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#00C495]">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center space-x-3 px-4 py-3 w-full text-white/90 hover:bg-[#008F6B] hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">{loading ? 'Logging out...' : 'Log out'}</span>
        </button>
      </div>
    </div>
  );
}