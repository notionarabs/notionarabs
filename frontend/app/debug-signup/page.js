'use client';

import { useState } from 'react';
import api from '../../lib/api';

export default function DebugSignupPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    try {
      console.log('Testing signup API...');
      const response = await api.post('/auth/signup', {
        name: 'Debug Test User',
        email: `debug${Date.now()}@example.com`,
        password: '123456'
      });

      console.log('API Response:', response);
      console.log('Response Data:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('API Error:', error);
      setResult({ error: error.message, response: error.response?.data });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Signup API</h1>

        <button
          onClick={testSignup}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Signup API'}
        </button>

        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-200 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
