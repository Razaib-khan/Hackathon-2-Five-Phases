'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Submission } from '../../lib/types';
import EvaluationForm from './EvaluationForm';

export default function JudgeDashboard() {
  const { api, user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

  useEffect(() => {
    if (user?.role === 'judge' || user?.role === 'admin') {
      fetchSubmissions();
    }
  }, [user, activeTab]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      if (activeTab === 'available') {
        // Get submissions that need to be evaluated by this judge
        const response = await api.get<{ data: Submission[] }>('/submissions/for-evaluation');
        setSubmissions(response.data);
      } else {
        // Get evaluations submitted by this judge
        const response = await api.get<any>(`/evaluations/evaluator/${user?.id}`);
        // Transform evaluations to submissions for display
        const submissionsFromEvals = response.data.map((evalData: any) => evalData.submission as Submission);
        setSubmissions(submissionsFromEvals);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (evaluationData: any) => {
    // Refresh the list after evaluation
    await fetchSubmissions();
    setSelectedSubmission(null);
  };

  const handleCancelEvaluation = () => {
    setSelectedSubmission(null);
  };

  if (user?.role !== 'judge' && user?.role !== 'admin') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-red-500">Access denied. Only judges and admins can evaluate submissions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Judge Dashboard</h2>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submissions to Evaluate
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Evaluations
          </button>
        </nav>
      </div>

      {selectedSubmission ? (
        <EvaluationForm
          submission={selectedSubmission}
          onSubmit={handleEvaluate}
          onCancel={handleCancelEvaluation}
        />
      ) : (
        <div>
          {submissions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">
                {activeTab === 'available'
                  ? 'No submissions are available for evaluation at this time.'
                  : 'You have not evaluated any submissions yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{submission.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{submission.description}</p>

                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Team:</span>
                          <p className="text-gray-600">{submission.team?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <p className="text-gray-600 capitalize">{submission.category}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Submitted:</span>
                          <p className="text-gray-600">{new Date(submission.submitted_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <p className="text-gray-600">{submission.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {activeTab === 'available' && (
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Evaluate
                        </button>
                      )}
                      <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                        View Details
                      </button>
                    </div>
                  </div>

                  {submission.demo_link && (
                    <div className="mt-3">
                      <a
                        href={submission.demo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Demo
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}