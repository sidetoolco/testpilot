import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { UserPlus } from 'lucide-react';
import { Profile } from '../lib/db';
import { TeamMembersTable } from '../components/settings/team/TeamMembersTable';
import { InviteModal } from '../components/settings/team/InviteTeamMemberModal';

export default function TeamSettings() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

        const teamProfiles: Profile[] = (profiles as any) || [];

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
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus className="h-5 w-5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <TeamMembersTable profiles={profiles} />

      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
}
