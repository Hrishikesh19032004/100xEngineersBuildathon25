import React, { useState } from "react";
import axios from "axios";

export default function YTChecker() {
  const [channel, setChannel] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!channel.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5002/analyze", {
        channel: channel.trim(),
      });
      setResult(res.data);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-400">
          YouTube Channel Checker
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="e.g. MrBeast"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {loading ? "Checking..." : "Check Channel"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-700/40 p-6 rounded-xl space-y-3">
            <p>
              <span className="text-gray-400">Channel:</span>{" "}
              <span className="font-semibold text-purple-300">@{result.channel}</span>
            </p>
            <p>
              <span className="text-gray-400">Subscribers:</span>{" "}
              <span className="font-medium">{result.subscribers}</span>
            </p>
            <p>
              <span className="text-gray-400">Videos:</span>{" "}
              <span className="font-medium">{result.videos}</span>
            </p>
            <p>
              <span className="text-gray-400">Latest Views:</span>{" "}
              <span className="font-medium">{result.latestViews}</span>
            </p>
            <p>
              <span className="text-gray-400">Latest Upload:</span>{" "}
              <span className="font-medium">{result.latestUpload}</span>
            </p>
            <p className="text-red-400 font-semibold text-lg mt-2">{result.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
