'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SubmissionForm from '../../components/submissions/SubmissionForm';

export default function SubmissionsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please sign in to access submissions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Submissions</h1>
        <p className="text-gray-600">Submit your projects or view existing submissions</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('submit')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submit Project
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            View Submissions
          </button>
        </nav>
      </div>

      {activeTab === 'submit' && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Hackathon and Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hackathon" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Hackathon
                </label>
                <select
                  id="hackathon"
                  value={selectedHackathon}
                  onChange={(e) => setSelectedHackathon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a hackathon</option>
                  <option value="1">Global Innovation Challenge 2024</option>
                  <option value="2">AI Solutions Hackathon</option>
                  <option value="3">Green Tech Challenge</option>
                </select>
              </div>

              <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Team
                </label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a team</option>
                  <option value="1">My Awesome Team</option>
                  <option value="2">Innovation Squad</option>
                  <option value="3">Tech Enthusiasts</option>
                </select>
              </div>
            </div>
          </div>

          {selectedHackathon && selectedTeam ? (
            <SubmissionForm hackathonId={selectedHackathon} teamId={selectedTeam} />
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-700">Please select both a hackathon and a team to submit your project.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'view' && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Submissions</h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">AI-Powered Sustainability Solution</h3>
              <p className="text-sm text-gray-600 mt-1">Submitted to Global Innovation Challenge 2024</p>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600">Submitted</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Score:</span>
                  <p className="text-gray-600">Pending</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <p className="text-gray-600">Jan 10, 2024</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600">Innovation</p>
                </div>
              </div>

              <div className="mt-3 flex space-x-2">
                <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  View Details
                </button>
                <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                  Download Files
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Smart City Traffic Optimization</h3>
              <p className="text-sm text-gray-600 mt-1">Submitted to AI Solutions Hackathon</p>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-green-600 font-medium">Evaluated</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Score:</span>
                  <p className="text-gray-600">87/100</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <p className="text-gray-600">Dec 15, 2023</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600">Technical</p>
                </div>
              </div>

              <div className="mt-3 flex space-x-2">
                <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  View Details
                </button>
                <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                  View Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}