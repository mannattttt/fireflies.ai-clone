"use client";

import { useEffect, useState } from "react";

/**
 * Temporary hello-world page to verify the frontend ↔ backend round trip.
 * Will be replaced with the dashboard in Step 4.
 */
export default function Home() {
  const [message, setMessage] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setMessage(data.message))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔥 Fireflies.ai Clone
        </h1>
        <p className="text-gray-500 mb-6">Frontend ↔ Backend Connection Test</p>

        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            <p className="font-medium">Connection Failed</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-red-500">
              Make sure the backend is running: <code>uvicorn main:app --reload</code>
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
            <p className="font-medium">✅ Backend says:</p>
            <p className="text-lg mt-1">{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
