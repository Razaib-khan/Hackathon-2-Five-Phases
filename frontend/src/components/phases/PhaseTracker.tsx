'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Hackathon, Phase } from '../../lib/types';

interface PhaseTrackerProps {
  hackathonId: string;
}

interface HackathonWithPhases extends Hackathon {
  phases: Phase[];
}

export default function PhaseTracker({ hackathonId }: PhaseTrackerProps) {
  const { api } = useAuth();
  const [hackathon, setHackathon] = useState<HackathonWithPhases | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchHackathonData();
  }, [hackathonId]);

  const fetchHackathonData = async () => {
    try {
      setLoading(true);

      // Fetch hackathon details with phases
      const response = await api.get(`/hackathons/${hackathonId}`);
      setHackathon(response.data);

      // Fetch current active phase
      const phaseResponse = await api.get(`/hackathons/${hackathonId}/current-phase`);
      if (phaseResponse.data.current_phase) {
        setCurrentPhase(phaseResponse.data.current_phase);
      }
    } catch (error) {
      console.error('Error fetching hackathon data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining in current phase
  useEffect(() => {
    if (!currentPhase?.end_date) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(currentPhase.end_date).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        return 'Phase ended';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      return `${days}d ${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [currentPhase]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-gray-500">Hackathon not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Phase: {currentPhase?.name || 'N/A'}</h2>

      <div className="space-y-4">
        {currentPhase ? (
          <>
            <div>
              <h3 className="font-medium text-gray-700">Description</h3>
              <p className="text-gray-600">{currentPhase.description || 'No description available.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Start Date</h3>
                <p className="text-gray-600">{new Date(currentPhase.start_date).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">End Date</h3>
                <p className="text-gray-600">{new Date(currentPhase.end_date).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-1">Time Remaining</h3>
              <p className="text-2xl font-bold text-blue-600">{timeLeft}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-600">No active phase at the moment.</p>
        )}

        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-2">Phase Timeline</h3>
          <div className="relative pl-8 border-l-2 border-gray-200 space-y-6">
            {hackathon.phases?.map((phase, index) => (
              <div key={phase.id} className="relative">
                <div className={`absolute -left-11 w-6 h-6 rounded-full flex items-center justify-center ${
                  currentPhase?.id === phase.id
                    ? 'bg-blue-500 text-white'
                    : phase.start_date < new Date().toISOString()
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-800'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">{phase.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(phase.start_date).toLocaleDateString()} - {new Date(phase.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}