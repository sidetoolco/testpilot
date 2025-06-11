import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Beaker,
  Package,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Settings,
  Users,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

const menuItems = [
  { path: '/my-tests', icon: Beaker, label: 'My Tests' },
  { path: '/all-products', icon: Package, label: 'My Products' },
  { path: '/support', icon: HelpCircle, label: 'Support Videos' },
];

export default function SideNav() {
  const location = useLocation();
  const { signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden p-6 border-b border-[#00C495] bg-[#00A67E] flex justify-between items-center">
        <button
          onClick={toggleMenu}
          className="z-50 p-2 rounded-lg bg-[#00A67E] text-white hover:bg-[#008F6B]"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Logo */}
        <Link
          to="/my-tests"
          className="flex items-center space-x-2"
          onClick={() => setIsOpen(false)}
        >
          <div className="bg-[#00A67E] p-2 rounded-lg">
            <img src="/assets/images/testpilot-logo.png" alt="TestPilot" className="h-8" />
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
      <div
        className={`
        fixed lg:static
        inset-y-0 left-0
        w-56 h-full
        bg-[#00A67E]
        flex flex-col
        transition-transform duration-300 ease-in-out
        z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="p-6 border-b border-[#00C495]">
          <Link to="/my-tests" className="flex items-center space-x-2">
            <img src="/assets/images/testpilot-logo.png" alt="TestPilot" className="h-8" />
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 lg:mt-2 mt-20">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
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

            {/* Settings with dropdown */}
            <li>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                  isActive('/settings') || isActive('/settings/team')
                    ? 'bg-[#008F6B] text-white'
                    : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </div>
              </button>
              {isSettingsOpen && (
                <ul className="mt-2 ml-4 space-y-1">
                  <li>
                    <Link
                      to="/settings/team"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive('/settings/team')
                          ? 'bg-[#008F6B] text-white'
                          : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Team</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
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
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
