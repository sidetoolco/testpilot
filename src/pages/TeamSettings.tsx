import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { UserPlus } from 'lucide-react';
import { Profile } from '../lib/db';

export default function TeamSettings() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        if (!user?.email) {
          setError('No user email found');
          return;
        }

        // First get the user's profile to get their company_id
        const { data, error: userError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('email', user.email as any)
          .single();

        const userProfile: Profile = data as any;

        if (userError) throw userError;

        // Then get all profiles for that company
        const { data: profiles, error: teamError } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', userProfile.company_id as any);

        if (teamError) throw teamError;

        const teamProfiles: Profile[] = profiles as any || [];

        setProfiles(teamProfiles);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A67E]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-[#00A67E] text-white rounded-lg hover:bg-[#008F6B] transition-colors"
          onClick={() => {
            // TODO: Implement invite functionality
            console.log('Invite button clicked');
          }}
        >
          <UserPlus className="h-5 w-5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map(profile => (
              <tr key={profile.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {profile.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={profile.avatar_url}
                          alt={profile.full_name || profile.email}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {profile.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500">{profile.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      profile.role === 'owner'
                        ? 'bg-purple-100 text-purple-800'
                        : profile.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {profile.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profile.company_joined_at
                    ? new Date(profile.company_joined_at).toLocaleDateString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
