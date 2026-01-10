'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SecuritySummary {
  total_security_events: number;
  failed_login_attempts: number;
  admin_actions_performed: number;
}

interface SuspiciousActivity {
  ip_address: string;
  failed_attempts: number;
}

interface RecentSecurityEvent {
  id: string;
  action: string;
  user_id: string;
  ip_address: string;
  timestamp: string;
  metadata: string | null;
}

interface SecurityDashboardData {
  period_days: number;
  security_summary: SecuritySummary;
  suspicious_activities: SuspiciousActivity[];
  recent_security_events: RecentSecurityEvent[];
}

const SecurityDashboard = () => {
  const { api } = useAuth();
  const [data, setData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchSecurityDashboard();
  }, [days]);

  const fetchSecurityDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get<SecurityDashboardData>(`/admin/security-dashboard?days=${days}`);
      setData(response);
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-red-500">Failed to load security dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Security Dashboard</h3>
        <div className="flex items-center space-x-4">
          <label htmlFor="dashboard-days" className="text-sm text-gray-600">Show last</label>
          <select
            id="dashboard-days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <span className="text-sm text-gray-600">days</span>
        </div>
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-medium text-red-800">Security Events</h4>
          <p className="text-2xl font-bold text-red-600">{data.security_summary.total_security_events}</p>
          <p className="text-xs text-red-600 mt-1">Security events in period</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800">Failed Logins</h4>
          <p className="text-2xl font-bold text-yellow-600">{data.security_summary.failed_login_attempts}</p>
          <p className="text-xs text-yellow-600 mt-1">Failed login attempts</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800">Admin Actions</h4>
          <p className="text-2xl font-bold text-blue-600">{data.security_summary.admin_actions_performed}</p>
          <p className="text-xs text-blue-600 mt-1">Actions performed by admins</p>
        </div>
      </div>

      {/* Suspicious Activities */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">Suspicious Activities</h4>
        {data.suspicious_activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed Attempts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.suspicious_activities.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.ip_address}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {activity.failed_attempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No suspicious activities detected</p>
        )}
      </div>

      {/* Recent Security Events */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">Recent Security Events</h4>
        {data.recent_security_events.length > 0 ? (
          <div className="space-y-3">
            {data.recent_security_events.map((event) => (
              <div key={event.id} className="flex items-start text-sm border-b border-gray-100 pb-3">
                <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mr-3">
                  {event.action.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div>
                  <p>
                    <span className="font-medium">{event.user_id === 'SYSTEM' ? 'SYSTEM' : event.user_id}</span> - {event.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-500">
                    {event.ip_address || 'N/A'} • {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent security events</p>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;