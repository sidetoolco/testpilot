import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://i.imghippo.com/files/QfED5977I.png"
                alt="TestPilot"
                className="h-8"
              />
            </Link>
            
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive('/') 
                    ? 'border-primary-400 text-[#1B1B1B]' 
                    : 'border-transparent text-gray-500 hover:text-[#1B1B1B]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/all-sessions"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive('/all-sessions') 
                    ? 'border-primary-400 text-[#1B1B1B]' 
                    : 'border-transparent text-gray-500 hover:text-[#1B1B1B]'
                }`}
              >
                All sessions
                <span className="ml-2 inline-block w-2 h-2 bg-[#00A67E] rounded-full"></span>
              </Link>
              <Link
                to="/all-products"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive('/all-products') 
                    ? 'border-primary-400 text-[#1B1B1B]' 
                    : 'border-transparent text-gray-500 hover:text-[#1B1B1B]'
                }`}
              >
                My Products
              </Link>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-[#1B1B1B]"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;