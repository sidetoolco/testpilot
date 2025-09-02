import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Beaker,
  Package,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Settings,
  Users,
  DollarSign,
  Percent,
  Building2,
  Shield,
  Brain,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  useTestCreationState,
  useTestCreation,
} from '../../features/tests/context/TestCreationContext';
import IncompleteTestModal from '../ui/IncompleteTestModal';
import { toast } from 'sonner';
import { useAdmin } from '../../hooks/useAdmin';

const menuItems = [
  { path: '/my-tests', icon: Beaker, label: 'My Tests' },
  { path: '/all-products', icon: Package, label: 'My Products' },
  { path: '/support', icon: HelpCircle, label: 'Support Videos' },
];

// Steps where a test is considered in progress
const testInProgressSteps = [
  'search',
  'competitors',
  'variations',
  'demographics',
  'preview',
  'review',
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isAdmin } = useAdmin();

  // Safely use the test creation context state and functions
  let testState = null;
  let saveIncompleteTest = null;

  try {
    testState = useTestCreationState();
    const testCreationContext = useTestCreation();
    saveIncompleteTest = testCreationContext.saveIncompleteTest;
  } catch (error) {
    // If we're not in the TestCreationProvider context, that's fine
    // The component will work without test creation functionality
  }

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      // Check if there's a test in progress
      if (
        location.pathname === '/create-test' &&
        testState &&
        testState.isInProgress &&
        testState.currentStep &&
        testInProgressSteps.includes(testState.currentStep)
      ) {
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

    // Check if there's a test in progress
    if (
      location.pathname === '/create-test' &&
      testState &&
      testState.isInProgress &&
      testState.currentStep &&
      testInProgressSteps.includes(testState.currentStep)
    ) {
      setPendingNavigation(path);
      setShowIncompleteModal(true);
      return;
    }

    // Normal navigation
    navigate(path);
    setIsOpen(false);
  };

  const handleSaveTest = async (testName?: string) => {
    if (!testState || !saveIncompleteTest) return;

    setIsSaving(true);
    try {
      // If a name is provided, update the testData
      if (testName && testState.testData) {
        testState.testData.name = testName;
      }

      // Use the saveIncompleteTest function from context
      await saveIncompleteTest();
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

    // Allow immediate navigation when clicking Discard
    if (pendingNavigation) {
      if (pendingNavigation === '/logout') {
        signOut();
      } else {
        navigate(pendingNavigation);
      }
      setPendingNavigation(null);
    }
  };

  const handleCloseModal = () => {
    setShowIncompleteModal(false);
    // Don't navigate, just close the modal and stay where the user is
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-[#00A67E] px-4">
        {/* Container for your content with vertical padding */}
        <div className="flex justify-between items-center py-4">
          <button
            onClick={toggleMenu}
            className="z-50  rounded-lg bg-[#00A67E] text-white hover:bg-[#008F6B]"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          {/* Logo */}
          <a
            href="/my-tests"
            onClick={e => handleNavigation('/my-tests', e)}
            className="flex items-center space-x-2"
          >
            <div className="bg-[#00A67E] p-2 rounded-lg">
              <img src="/assets/images/testpilot-logo.png" alt="TestPilot" className="h-8" />
            </div>
          </a>
        </div>
        {/* This div acts as the inset border */}
        <div className="border-b border-[#00C495]"></div>
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
        <div className="mx-auto px-10 py-6 border-b border-[#00C495]">
          <a
            href="/my-tests"
            onClick={e => handleNavigation('/my-tests', e)}
            className="flex items-center space-x-2"
          >
            <img src="/assets/images/testpilot-logo.png" alt="TestPilot" className="h-8" />
          </a>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-3 ">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.path}>
                <a
                  href={item.path}
                  onClick={e => handleNavigation(item.path, e)}
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

            {/* Admin Menu Items */}
            {isAdmin && (
              <>
                <li className="pt-4 border-t border-[#00C495]">
                  <div className="px-4 py-2">
                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Admin</span>
                  </div>
                </li>
                <li>
                  <a
                    href="/users"
                    onClick={e => handleNavigation('/users', e)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/users')
                        ? 'bg-[#008F6B] text-white'
                        : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Users</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/companies"
                    onClick={e => handleNavigation('/admin/companies', e)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin/companies')
                        ? 'bg-[#008F6B] text-white'
                        : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">Companies</span>
                  </a>
                </li>
              </>
            )}

            {/* Settings with dropdown */}
            <li>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                  isActive('/settings') ||
                  isActive('/settings/team') ||
                  isActive('/settings/billing') ||
                  isActive('/settings/coupons')
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
                      onClick={e => handleNavigation('/settings/team', e)}
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
                  <li>
                    <a
                      href="/settings/billing"
                      onClick={e => handleNavigation('/settings/billing', e)}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive('/settings/billing')
                          ? 'bg-[#008F6B] text-white'
                          : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Billing</span>
                    </a>
                  </li>
                  {isAdmin && (
                                      <li>
                    <a
                      href="/settings/coupons"
                      onClick={e => handleNavigation('/settings/coupons', e)}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive('/settings/coupons')
                          ? 'bg-[#008F6B] text-white'
                          : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                      }`}
                    >
                      <Percent className="h-4 w-4" />
                      <span className="font-medium">Coupons</span>
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href="/settings/expert-mode"
                    onClick={e => handleNavigation('/settings/expert-mode', e)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/settings/expert-mode')
                        ? 'bg-[#008F6B] text-white'
                        : 'text-white/90 hover:bg-[#008F6B] hover:text-white'
                    }`}
                  >
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">Expert Mode</span>
                  </a>
                </li>
              </ul>
            )}
          </li>
          </ul>
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4">
          <div className="border-t border-[#00C495] mb-2"></div>
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

      {/* Confirmation modal for incomplete tests */}
      <IncompleteTestModal
        isOpen={showIncompleteModal}
        onSave={handleSaveTest}
        onCancel={handleCancelNavigation}
        onClose={handleCloseModal}
        isSaving={isSaving}
        currentTestName={testState?.testData?.name}
      />
    </>
  );
}
