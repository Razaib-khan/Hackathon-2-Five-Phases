'use client';

import { useAuth } from '../../hooks/useAuth';
import TeamManagement from '../../components/teams/TeamManagement';

export default function TeamsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading teams...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please sign in to access teams.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600">Create, join, and manage your hackathon teams</p>
      </div>

      <TeamManagement userId={user.id} />
    </div>
  );
}