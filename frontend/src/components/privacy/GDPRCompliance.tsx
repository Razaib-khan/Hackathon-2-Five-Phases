'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function GDPRCompliance() {
  const { api, user } = useAuth();
  const [gdprRights, setGdprRights] = useState<any>(null);
  const [privacyPolicy, setPrivacyPolicy] = useState<any>(null);
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [retentionInfo, setRetentionInfo] = useState<any>(null);
  const [gdprRequests, setGdprRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'rights' | 'export' | 'deletion' | 'consent' | 'requests'>('rights');
  const [deletionReason, setDeletionReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchGdprInfo();
  }, []);

  const fetchGdprInfo = async () => {
    try {
      const rightsResponse = await api.get('/gdpr/rights-info');
      setGdprRights(rightsResponse.data);

      const policyResponse = await api.get('/gdpr/privacy-policy');
      setPrivacyPolicy(policyResponse.data);

      const retentionResponse = await api.get('/gdpr/retention-info');
      setRetentionInfo(retentionResponse.data);

      const requestsResponse = await api.get('/gdpr/requests');
      setGdprRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching GDPR info:', error);
    }
  };

  const handleDataExport = async () => {
    setDataExportLoading(true);
    try {
      const response = await api.get('/gdpr/data-export');

      // Create a download link for the data
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportLink = document.createElement('a');
      exportLink.setAttribute('href', dataUri);
      exportLink.setAttribute('download', `personal-data-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(exportLink);
      exportLink.click();
      document.body.removeChild(exportLink);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setDataExportLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    setDeletionLoading(true);
    try {
      await api.post('/gdpr/request-deletion', {
        reason: deletionReason
      });

      alert('Account deletion request submitted successfully. Your account will be deactivated and data anonymized.');
      setShowConfirmModal(false);
      setDeletionReason('');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    setConsentLoading(true);
    try {
      await api.post('/gdpr/withdraw-consent');
      alert('Consent withdrawn successfully. Your data will be processed according to the new settings.');
    } catch (error) {
      console.error('Error withdrawing consent:', error);
    } finally {
      setConsentLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy & GDPR Compliance</h2>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rights')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Your Rights
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Export
          </button>
          <button
            onClick={() => setActiveTab('deletion')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deletion'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Deletion
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'consent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Consent Management
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Request History
          </button>
        </nav>
      </div>

      {activeTab === 'rights' && gdprRights && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">About Your Rights</h3>
            <p className="text-sm text-blue-700">
              We respect your privacy and are committed to protecting your personal data.
              Under GDPR regulations, you have specific rights regarding your personal information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gdprRights.rights.map((right: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{right.right}</h4>
                <p className="text-sm text-gray-600 mt-1">{right.description}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
            <div className="text-sm text-gray-600">
              <p>Data Protection Officer: {privacyPolicy?.contact?.data_protection_officer}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Data Export</h3>
            <p className="text-sm text-yellow-700">
              You have the right to receive your personal data in a structured, commonly used and machine-readable format.
              Click the button below to download your data.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleDataExport}
              disabled={dataExportLoading}
              className={`py-3 px-6 rounded-md text-white font-medium ${
                dataExportLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {dataExportLoading ? 'Exporting...' : 'Download My Data'}
            </button>
          </div>

          {retentionInfo && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Data Retention Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium">User Accounts:</span> {retentionInfo.user_accounts}</li>
                <li><span className="font-medium">Audit Logs:</span> {retentionInfo.audit_logs}</li>
                <li><span className="font-medium">Notifications:</span> {retentionInfo.notifications}</li>
                <li><span className="font-medium">Submissions:</span> {retentionInfo.submissions}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deletion' && (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Account Deletion</h3>
            <p className="text-sm text-red-700">
              You have the right to request erasure of your personal data.
              Please note that this action is irreversible and will permanently deactivate your account.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="deletion-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for deletion (optional)
              </label>
              <textarea
                id="deletion-reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Tell us why you're deleting your account..."
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleAccountDeletion}
                disabled={deletionLoading}
                className={`py-3 px-6 rounded-md text-white font-medium ${
                  deletionLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deletionLoading ? 'Processing...' : 'Request Account Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consent' && (
        <div className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-2">Consent Management</h3>
            <p className="text-sm text-orange-700">
              You have provided consent for us to process your personal data.
              You can withdraw this consent at any time, though this may affect your ability to use certain features.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Current Consent Status</h4>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${user?.gdpr_consent ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {user?.gdpr_consent ? 'Consent Given' : 'Consent Not Given'}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleWithdrawConsent}
              disabled={consentLoading}
              className={`py-3 px-6 rounded-md text-white font-medium ${
                consentLoading
                  ? 'bg-orange-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {consentLoading ? 'Processing...' : 'Withdraw Consent'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">GDPR Request History</h3>
            <p className="text-sm text-purple-700">
              Below is a history of your GDPR-related requests. This includes data exports, deletions, and consent changes.
            </p>
          </div>

          {gdprRequests.length > 0 ? (
            <div className="space-y-3">
              {gdprRequests.map((request, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900">{request.action}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(request.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{request.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No GDPR requests found.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Account Deletion */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Account Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete your account? This action is irreversible and will permanently remove your data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 px-4 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDeletion}
                disabled={deletionLoading}
                className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                  deletionLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deletionLoading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}