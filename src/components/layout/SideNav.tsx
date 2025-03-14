import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Beaker, Package, LogOut, Menu, X, HelpCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function SideNav() {
  const location = useLocation();
  const { signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden p-6 border-b border-[#00C495] flex justify-between items-center">
        <button
          onClick={toggleMenu}
          className="z-50 p-2 rounded-lg bg-[#00A67E] text-white hover:bg-[#008F6B]"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Logo */}
        <Link to="/my-tests" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
          <div className="bg-white p-2 rounded-lg">
            <img
              src="https://i.imghippo.com/files/QfED5977I.png"
              alt="TestPilot"
              className="h-8"
            />
          </div>
        </Link>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static
        inset-y-0 left-0
        w-56 h-full
        bg-[#00A67E]
        flex flex-col
        transition-transform duration-300 ease-in-out
        z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>


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
        <nav className="flex-1 p-4 lg:mt-2 mt-20">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
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

        {/* Support */}
        <div className="p-4 border-t border-[#00C495]">
          <Link
            to="/support"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-1 px-4 py-3 w-full text-white/90 hover:bg-[#008F6B] hover:text-white rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="font-medium">Support</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#00C495]">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            disabled={loading}
            className="flex items-center space-x-3 px-4 py-3 w-full text-white/90 hover:bg-[#008F6B] hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{loading ? 'Logging out...' : 'Log out'}</span>
          </button>
        </div>
      </div>
    </>
  );
}