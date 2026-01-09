'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Hackathon } from '../../lib/types';
import SecurityDashboard from './SecurityDashboard';
import SecurityEventsTable from './SecurityEventsTable';
import SecurityAlerts from './SecurityAlerts';
import UserAuditLog from './UserAuditLog';

export default function AdminDashboard() {
  const { api, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [reports, setReports] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'hackathons' | 'monitoring' | 'reports' | 'security'>('users');
  const [newUserRole, setNewUserRole] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data);

      // Fetch hackathons
      const hackathonsResponse = await api.get('/admin/hackathons');
      setHackathons(hackathonsResponse.data);

      // Fetch reports
      const reportsResponse = await api.get('/admin/reports/platform-usage');
      setReports(reportsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setNewUserRole({ ...newUserRole, [userId]: '' });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const activateUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/activate`);

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: true } : u));
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/deactivate`);

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
    } catch (error) {
      console.error('Error deactivating user:', error);
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

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('hackathons')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hackathons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Hackathons
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Monitoring
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={newUserRole[user.id] || user.role}
                        onChange={(e) => setNewUserRole({ ...newUserRole, [user.id]: e.target.value })}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="participant">Participant</option>
                        <option value="judge">Judge</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => updateUserRole(user.id, newUserRole[user.id] || user.role)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Update Role
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => deactivateUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'hackathons' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Hackathon Management</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hackathons.map((hackathon) => (
              <div key={hackathon.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{hackathon.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{hackathon.description}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Start:</span>
                    <p className="text-gray-600">{new Date(hackathon.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">End:</span>
                    <p className="text-gray-600">{new Date(hackathon.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-gray-600 capitalize">{hackathon.status}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Participants:</span>
                    <p className="text-gray-600">{hackathon.max_participants || 'Unlimited'}</p>
                  </div>
                </div>

                <div className="mt-3 flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                    Edit
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                    View Phases
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">System Monitoring</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800">Active Users</h4>
              <p className="text-2xl font-bold text-blue-600">{reports.active_users || 0}</p>
              <p className="text-xs text-blue-600 mt-1">Currently online</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Active Hackathons</h4>
              <p className="text-2xl font-bold text-green-600">{reports.active_hackathons || 0}</p>
              <p className="text-xs text-green-600 mt-1">Currently running</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800">Today's Submissions</h4>
              <p className="text-2xl font-bold text-yellow-600">{reports.daily_submissions || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">Submitted today</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800">System Health</h4>
              <p className="text-2xl font-bold text-purple-600">98%</p>
              <p className="text-xs text-purple-600 mt-1">Operational</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start text-sm">
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3">JOIN</div>
                  <div>
                    <p><span className="font-medium">john_doe</span> joined hackathon <span className="font-medium">Global Innovation Challenge</span></p>
                    <p className="text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start text-sm">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3">SUBMIT</div>
                  <div>
                    <p><span className="font-medium">tech_team</span> submitted project <span className="font-medium">AI Solution</span></p>
                    <p className="text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start text-sm">
                  <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mr-3">CREATE</div>
                  <div>
                    <p><span className="font-medium">admin_user</span> created hackathon <span className="font-medium">Future Tech Summit</span></p>
                    <p className="text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Phase Transitions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Global Innovation Challenge</p>
                    <p className="text-gray-600">Registration → Ideation</p>
                  </div>
                  <span className="text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">AI Solutions Hackathon</p>
                    <p className="text-gray-600">Development → Submission</p>
                  </div>
                  <span className="text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Green Tech Challenge</p>
                    <p className="text-gray-600">Submission → Presentation</p>
                  </div>
                  <span className="text-gray-500">Yesterday</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">System Resources</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>62%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Reporting & Analytics</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800">Total Users</h4>
              <p className="text-2xl font-bold text-blue-600">{reports.total_users || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Active Hackathons</h4>
              <p className="text-2xl font-bold text-green-600">{reports.active_hackathons || 0}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800">Total Submissions</h4>
              <p className="text-2xl font-bold text-yellow-600">{reports.total_submissions || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800">Avg. Evaluation Score</h4>
              <p className="text-2xl font-bold text-purple-600">{reports.avg_evaluation_score || '0.0'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">User Growth (Last 30 Days)</h4>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2">User growth chart</p>
                  <p className="text-sm">Visualizing user registration trends</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Hackathon Participation</h4>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2">Participation chart</p>
                  <p className="text-sm">Showing engagement across hackathons</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Top Performing Teams</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Innovative Coders</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">87.5 avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tech Wizards</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">84.2 avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Future Builders</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">82.7 avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Digital Creators</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">80.4 avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Code Masters</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">79.8 avg</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Submission Categories</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Innovation</span>
                    <span>32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Technical</span>
                    <span>28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Design</span>
                    <span>22%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Social Impact</span>
                    <span>18%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Judge Activity</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Evaluations</span>
                  <span className="font-medium">{reports.total_evaluations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Time per Eval</span>
                  <span className="font-medium">12 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluation Completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Judge</span>
                  <span className="font-medium">jane_doe</span>
                </div>
                <div className="flex justify-between">
                  <span>Lowest Activity</span>
                  <span className="font-medium">bob_smith</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Export Reports</h4>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                Export All Data
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button className="border border-gray-300 rounded p-2 text-sm hover:bg-gray-50">
                User Data (CSV)
              </button>
              <button className="border border-gray-300 rounded p-2 text-sm hover:bg-gray-50">
                Submissions (CSV)
              </button>
              <button className="border border-gray-300 rounded p-2 text-sm hover:bg-gray-50">
                Evaluations (CSV)
              </button>
              <button className="border border-gray-300 rounded p-2 text-sm hover:bg-gray-50">
                Analytics (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SecurityDashboard />
            </div>
            <div>
              <SecurityEventsTable />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SecurityAlerts />
            </div>
            <div>
              <UserAuditLog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}