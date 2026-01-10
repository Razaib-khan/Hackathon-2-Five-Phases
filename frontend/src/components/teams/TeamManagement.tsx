'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Team, User } from '../../lib/types';

interface TeamManagementProps {
  userId: string;
}

export default function TeamManagement({ userId }: TeamManagementProps) {
  const { api } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [invitationEmail, setInvitationEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-teams' | 'create-team' | 'browse'>('my-teams');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Get user's teams
      const userTeamsResponse = await api.get<{ data: Team[] }>('/my-teams');
      setUserTeams(userTeamsResponse.data);

      // Get all available teams
      const allTeamsResponse = await api.get<{ data: Team[] }>('/teams');
      setTeams(allTeamsResponse.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const response = await api.get<{ data: User[] }>(`/teams/${teamId}/members`);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const response = await api.post<Team>('/teams', {
        name: newTeamName.trim(),
        description: `Team ${newTeamName.trim()} for hackathon collaboration`,
      });

      setUserTeams([...userTeams, response]);
      setNewTeamName('');
      setActiveTab('my-teams');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const joinTeam = async (teamId: string) => {
    try {
      await api.post(`/teams/${teamId}/join`);
      // Refresh user's teams
      const userTeamsResponse = await api.get<{ data: Team[] }>('/my-teams');
      setUserTeams(userTeamsResponse.data);
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  const leaveTeam = async (teamId: string) => {
    try {
      await api.delete(`/teams/${teamId}/leave`);
      // Refresh user's teams
      const userTeamsResponse = await api.get<{ data: Team[] }>('/my-teams');
      setUserTeams(userTeamsResponse.data);
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };

  const inviteMember = async (teamId: string) => {
    if (!invitationEmail.trim()) return;

    try {
      await api.post(`/teams/${teamId}/invite`, {
        email: invitationEmail,
      });
      setInvitationEmail('');
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const removeMember = async (teamId: string, memberId: string) => {
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
      if (selectedTeam?.id === teamId) {
        fetchTeamMembers(teamId);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-teams')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Teams
          </button>
          <button
            onClick={() => setActiveTab('create-team')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create-team'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create Team
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Browse Teams
          </button>
        </nav>
      </div>

      {activeTab === 'my-teams' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Teams</h2>

          {userTeams.length === 0 ? (
            <p className="text-gray-600">You're not part of any teams yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTeams.map((team) => (
                <div
                  key={team.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>

                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        fetchTeamMembers(team.id);
                      }}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      View Members
                    </button>
                    <button
                      onClick={() => leaveTeam(team.id)}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Leave Team
                    </button>
                  </div>

                  {selectedTeam?.id === team.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2">Team Members</h4>

                      <div className="space-y-2">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              {member.first_name} {member.last_name} ({member.username})
                            </span>
                            <button
                              onClick={() => removeMember(team.id, member.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex">
                        <input
                          type="email"
                          value={invitationEmail}
                          onChange={(e) => setInvitationEmail(e.target.value)}
                          placeholder="Invite member (email)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => inviteMember(team.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create-team' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Team</h2>

          <div className="space-y-2">
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter team name"
            />
          </div>

          <button
            onClick={createTeam}
            disabled={!newTeamName.trim()}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              newTeamName.trim()
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
          >
            Create Team
          </button>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Available Teams</h2>

          {teams.length === 0 ? (
            <p className="text-gray-600">No teams available to join.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>

                  <div className="mt-3">
                    <button
                      onClick={() => joinTeam(team.id)}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Join Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}