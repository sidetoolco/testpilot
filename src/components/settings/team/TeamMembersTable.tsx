import { Invite, Profile } from '../../../lib/db';

interface TeamMembersTableProps {
  profiles: Profile[];
  invites: Invite[];
}

export function TeamMembersTable({ profiles, invites }: TeamMembersTableProps) {
  return (
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
            <tr key={`profile-${profile.id}`}>
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
          {invites.map(invite => (
            <tr key={`invite-${invite.email}`} className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {invite.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  invited
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
