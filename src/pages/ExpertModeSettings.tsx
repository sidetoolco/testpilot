import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Brain, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpertModeSettings() {
  const { user } = useAuth();
  const [expertMode, setExpertMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpertModeStatus() {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // Get the user's profile to get their company_id
        const { data: profile, error: userError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        if (!profile?.company_id) throw new Error('No company found');

        setCompanyId(profile.company_id);

        // Get the company's expert mode status
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('expert_mode')
          .eq('id', profile.company_id)
          .single();

        if (companyError) throw companyError;
        setExpertMode(company?.expert_mode ?? false);
      } catch (err) {
        console.error('Error fetching expert mode status:', err);
        toast.error('Failed to load expert mode status');
      } finally {
        setLoading(false);
      }
    }

    fetchExpertModeStatus();
  }, [user?.id]);

  const handleToggleExpertMode = async () => {
    if (!companyId) return;

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('companies')
        .update({ expert_mode: !expertMode })
        .eq('id', companyId);

      if (error) throw error;

      setExpertMode(!expertMode);
      toast.success(
        expertMode 
          ? 'Expert mode disabled. Survey questions step will be hidden.' 
          : 'Expert mode enabled! Survey questions step is now available.'
      );
    } catch (err) {
      console.error('Error updating expert mode:', err);
      toast.error('Failed to update expert mode');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A67E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert Mode Settings</h1>
        <p className="text-gray-600">
          Configure advanced testing features for your company
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expert Mode</h3>
                <p className="text-sm text-gray-500">
                  Enable advanced testing features and custom survey questions
                </p>
              </div>
              
              <button
                onClick={handleToggleExpertMode}
                disabled={updating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  expertMode ? 'bg-blue-600' : 'bg-gray-200'
                } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    expertMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {updating && (
                  <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-blue-600" />
                )}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">What Expert Mode enables:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Custom Survey Questions:</strong> Choose from a wider range of survey questions beyond the default set</li>
                  </ul>
                  
                  {!expertMode && (
                    <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                      <p className="text-blue-900 text-sm">
                        <strong>Current behavior:</strong> Tests will use default survey questions (value, appearance, confidence, brand, convenience)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {expertMode && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">
                    Expert mode is now active! The survey questions step will be available in your test creation flow.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
