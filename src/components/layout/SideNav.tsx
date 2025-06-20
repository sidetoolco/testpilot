import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Beaker, Package, LogOut, Menu, X, HelpCircle, Settings, Users } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getGlobalTestState } from '../../pages/CreateConsumerTest';
import IncompleteTestModal from '../ui/IncompleteTestModal';
import { toast } from 'sonner';

const menuItems = [
  { path: '/my-tests', icon: Beaker, label: 'My Tests' },
  { path: '/all-products', icon: Package, label: 'My Products' },
  { path: '/support', icon: HelpCircle, label: 'Support Videos' },
];

// Steps donde se considera que hay un test en progreso
const testInProgressSteps = ['search', 'competitors', 'variations', 'demographics', 'preview', 'review'];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      // Verificar si hay test en progreso
      const testState = getGlobalTestState();
      if (location.pathname === '/create-test' && testState && testInProgressSteps.includes(testState.currentStep)) {
        setPendingNavigation('/logout');
        setShowIncompleteModal(true);
        return;
      }
      
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Verificar si hay test en progreso
    const testState = getGlobalTestState();
    if (location.pathname === '/create-test' && testState && testInProgressSteps.includes(testState.currentStep)) {
      setPendingNavigation(path);
      setShowIncompleteModal(true);
      return;
    }
    
    // Navegación normal
    navigate(path);
    setIsOpen(false);
  };

  const handleSaveTest = async (testName?: string) => {
    const testState = getGlobalTestState();
    if (!testState) return;

    setIsSaving(true);
    try {
      // Si se proporciona un nombre, actualizar el testData
      if (testName) {
        testState.testData.name = testName;
      }
      
      await testState.saveIncompleteTest();
      setShowIncompleteModal(false);
      
      if (pendingNavigation) {
        if (pendingNavigation === '/logout') {
          await signOut();
        } else {
          navigate(pendingNavigation);
        }
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error('Failed to save test. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNavigation = () => {
    setShowIncompleteModal(false);
    
    // Permitir navegación inmediata al hacer click en Discard
    if (pendingNavigation) {
      if (pendingNavigation === '/logout') {
        signOut();
      } else {
        navigate(pendingNavigation);
      }
      setPendingNavigation(null);
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
        <a
          href="/my-tests"
          onClick={(e) => handleNavigation('/my-tests', e)}
          className="flex items-center space-x-2"
        >
          <div className="bg-[#00A67E] p-2 rounded-lg">
            <img src="/assets/images/testpilot-logo.png" alt="TestPilot" className="h-8" />
          </div>
        </a>
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
          <a 
            href="/my-tests" 
            onClick={(e) => handleNavigation('/my-tests', e)}
            className="flex items-center space-x-2"
          >
            <img src="/assets/images/testpilot-logo.png" alt="TestPilot" className="h-8" />
          </a>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 lg:mt-2 mt-20">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.path}>
                <a
                  href={item.path}
                  onClick={(e) => handleNavigation(item.path, e)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#008F6B] text-white'
                      : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
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
                    <a
                      href="/settings/team"
                      onClick={(e) => handleNavigation('/settings/team', e)}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive('/settings/team')
                          ? 'bg-[#008F6B] text-white'
                          : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Team</span>
                    </a>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button
                onClick={handleLogout}
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

      {/* Modal de confirmación para tests incompletos */}
      <IncompleteTestModal
        isOpen={showIncompleteModal}
        onSave={handleSaveTest}
        onCancel={handleCancelNavigation}
        isSaving={isSaving}
        currentTestName={getGlobalTestState()?.testData?.name}
      />
    </>
  );
}
