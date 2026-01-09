'use client';

import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Five Phase Hackathon Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage hackathons through all five phases: Registration, Ideation, Development, Submission, and Presentation/Judging
        </p>

        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Register
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">Welcome back, {user?.username}!</p>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Registration</h2>
          <p className="text-gray-600">Sign up and create your profile to participate in hackathons.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Team Formation</h2>
          <p className="text-gray-600">Create or join teams to collaborate on your hackathon projects.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Project Submission</h2>
          <p className="text-gray-600">Submit your projects during the submission phase for evaluation.</p>
        </div>
      </div>
    </div>
  );
}