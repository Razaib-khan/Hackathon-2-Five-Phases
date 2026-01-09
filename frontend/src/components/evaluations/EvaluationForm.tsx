'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Submission } from '../../lib/types';

interface EvaluationFormProps {
  submission: Submission;
  onSubmit: (evaluationData: any) => void;
  onCancel: () => void;
}

interface CriterionScore {
  criterion_name: string;
  score: number;
  feedback: string;
}

export default function EvaluationForm({ submission, onSubmit, onCancel }: EvaluationFormProps) {
  const { api } = useAuth();
  const [overallScore, setOverallScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [criteriaScores, setCriteriaScores] = useState<CriterionScore[]>([
    { criterion_name: 'Innovation', score: 0, feedback: '' },
    { criterion_name: 'Technical Complexity', score: 0, feedback: '' },
    { criterion_name: 'Design & User Experience', score: 0, feedback: '' },
    { criterion_name: 'Functionality', score: 0, feedback: '' },
    { criterion_name: 'Impact Potential', score: 0, feedback: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCriterionChange = (index: number, field: keyof CriterionScore, value: string | number) => {
    const updatedCriteria = [...criteriaScores];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value
    };
    setCriteriaScores(updatedCriteria);

    // Recalculate overall score
    const totalScore = updatedCriteria.reduce((sum, criterion) => sum + criterion.score, 0);
    setOverallScore(totalScore);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const evaluationData = {
        submission_id: submission.id,
        overall_score: overallScore,
        feedback,
        criteria_scores: criteriaScores
      };

      await api.post('/evaluations', evaluationData);
      onSubmit(evaluationData);
    } catch (err) {
      setError('Failed to submit evaluation. Please try again.');
      console.error('Error submitting evaluation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Evaluate Submission</h2>

      <div className="mb-4">
        <h3 className="font-medium text-gray-800">{submission.title}</h3>
        <p className="text-sm text-gray-600">Team: {submission.team?.name}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Score: <span className="font-bold text-blue-600">{overallScore}</span>
          </label>
          <div className="text-sm text-gray-600 mb-4">
            Calculated from individual criteria scores below
          </div>
        </div>

        <div className="space-y-4">
          {criteriaScores.map((criterion, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">{criterion.criterion_name}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score (0-10)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={criterion.score}
                    onChange={(e) => handleCriterionChange(index, 'score', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-right text-sm font-medium text-gray-700">
                    {criterion.score}/10
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={criterion.feedback}
                    onChange={(e) => handleCriterionChange(index, 'feedback', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Provide specific feedback for this criterion..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="general-feedback" className="block text-sm font-medium text-gray-700 mb-1">
            General Feedback
          </label>
          <textarea
            id="general-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Provide overall feedback and recommendations..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
              submitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}