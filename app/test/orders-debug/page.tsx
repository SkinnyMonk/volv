'use client';

import { useState } from 'react';
import { setAuthToken, apiV1 } from '@/lib/axios';
import { fetchOrders } from '@/lib/api/orders';

export default function OrdersDebugPage() {
  const [token, setToken] = useState('');
  const [clientId, setClientId] = useState('MS3122');
  const [orderType, setOrderType] = useState<'completed' | 'pending' | 'all'>('completed');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<Record<string, unknown> | unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetToken = () => {
    if (!token) {
      setError('Please enter a token');
      return;
    }
    setAuthToken(token);
    setError(null);
    alert('Token set successfully');
  };

  const handleFetchOrders = async () => {
    if (!token) {
      setError('Please set a token first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching orders with:', { clientId, orderType });
      
      const orders = await fetchOrders(orderType, clientId);
      setResponse(orders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectApiCall = async () => {
    if (!token) {
      setError('Please set a token first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Making direct API call...');
      
      const response = await apiV1.get('/orders', {
        params: {
          type: orderType,
          client_id: clientId,
        },
        headers: {
          'x-authorization-token': token,
        },
      });
      
      setResponse(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Orders API Debug</h1>

      {/* Token Input */}
      <div className="mb-6 p-4 bg-slate-800 rounded">
        <h2 className="text-lg font-semibold mb-4">Step 1: Set Authorization Token</h2>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 bg-slate-700 text-white rounded mb-2"
          placeholder="Paste your x-authorization-token here"
          rows={3}
        />
        <button
          onClick={handleSetToken}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Set Token
        </button>
      </div>

      {/* Parameters */}
      <div className="mb-6 p-4 bg-slate-800 rounded">
        <h2 className="text-lg font-semibold mb-4">Step 2: Set Parameters</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Client ID</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2 bg-slate-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full p-2 bg-slate-700 text-white rounded"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Calls */}
      <div className="mb-6 p-4 bg-slate-800 rounded">
        <h2 className="text-lg font-semibold mb-4">Step 3: Fetch Orders</h2>
        <div className="flex gap-4">
          <button
            onClick={handleFetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded"
          >
            {loading ? 'Loading...' : 'Fetch Orders (Hook)'}
          </button>
          <button
            onClick={handleDirectApiCall}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded"
          >
            {loading ? 'Loading...' : 'Fetch Orders (Direct API)'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
          <p className="text-red-300 font-mono text-sm whitespace-pre-wrap break-words">
            {error}
          </p>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="p-4 bg-slate-800 rounded">
          <h3 className="text-lg font-semibold mb-2">Response</h3>
          <pre className="bg-slate-900 p-4 rounded text-xs overflow-auto max-h-96 text-green-400">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
