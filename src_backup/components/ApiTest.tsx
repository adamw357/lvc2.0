import React, { useEffect, useState } from 'react';
import { testApiConnection } from '@/services/api';

export const ApiTest = () => {
  const [status, setStatus] = useState<'Testing...' | 'Connected' | 'Failed'>('Testing...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Starting API connection test...');
        const result = await testApiConnection();
        console.log('API test result:', result);
        setStatus(result ? 'Connected' : 'Failed');
      } catch (error) {
        console.error('API test error:', error);
        setStatus('Failed');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold">API Connection Test</h2>
      <p>Status: <span className={status === 'Connected' ? 'text-green-600' : status === 'Failed' ? 'text-red-600' : 'text-yellow-600'}>{status}</span></p>
    </div>
  );
}; 