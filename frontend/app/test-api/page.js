'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

export default function TestApiPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const testApi = async () => {
    setLoading(true);
    try {
      // Test basic API connection
      const healthResponse = await api.get('/health');
      console.log('Health check:', healthResponse.data);

      // Test template creation with minimal data
      const templateData = {
        title: 'Test Template',
        description: 'This is a test template',
        category: 'الإنتاجية',
        price: 25.00,
        notionLink: 'https://notion.so/test-template',
        difficulty: 'beginner'
      };

      console.log('Sending template data:', templateData);
      console.log('User data:', user);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Creator status:', user?.creatorStatus);

      const response = await api.post('/templates', templateData);
      console.log('Template creation response:', response.data);
      setResult({ success: true, data: response.data });
    } catch (error) {
      console.error('API test error:', error);
      console.error('Error response:', error.response?.data);
      setResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Test Page</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ user, isAuthenticated }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <button
            onClick={testApi}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Template Creation API'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">API Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
