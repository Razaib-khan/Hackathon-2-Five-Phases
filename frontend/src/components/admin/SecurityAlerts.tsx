'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const SecurityAlerts = () => {
  const { api } = useAuth();
  const [alertType, setAlertType] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alertType.trim() || !message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await api.post('/admin/security-alert', {
        alert_type: alertType,
        message,
        severity
      });

      setSuccessMessage(`Security alert '${alertType}' logged successfully!`);
      setAlertType('');
      setMessage('');
    } catch (error) {
      console.error('Error creating security alert:', error);
      alert('Failed to create security alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Security Alerts</h3>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="alertType" className="block text-sm font-medium text-gray-700 mb-1">
            Alert Type
          </label>
          <input
            type="text"
            id="alertType"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            placeholder="e.g., suspicious-login, unauthorized-access, data-breach"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Describe the security incident or concern..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-sm font-medium ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Logging Alert...' : 'Log Security Alert'}
        </button>
      </form>

      <div className="mt-8">
        <h4 className="text-md font-medium text-gray-900 mb-3">Common Security Alert Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <span className="font-medium">suspicious-login</span>
            <p className="text-gray-600 mt-1">Multiple failed login attempts</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <span className="font-medium">unauthorized-access</span>
            <p className="text-gray-600 mt-1">Access to restricted areas</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <span className="font-medium">data-breach</span>
            <p className="text-gray-600 mt-1">Potential data exposure</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <span className="font-medium">malware-detected</span>
            <p className="text-gray-600 mt-1">Malicious software detected</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <span className="font-medium">brute-force-attack</span>
            <p className="text-gray-600 mt-1">Coordinated attack attempt</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <span className="font-medium">privilege-escalation</span>
            <p className="text-gray-600 mt-1">Unauthorized privilege increase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;