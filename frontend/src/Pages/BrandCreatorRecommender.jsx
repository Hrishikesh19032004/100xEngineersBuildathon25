import React, { useState } from "react";

const BrandCreatorRecommender = () => {
  const [formData, setFormData] = useState({
    brand_budget_usd: "",
    country: "",
    product_category: "",
    min_views_required: "",
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await fetch("http://localhost:5001/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_budget_usd: Number(formData.brand_budget_usd),
          country: formData.country,
          product_category: formData.product_category,
          min_views_required: Number(formData.min_views_required),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      if (data.top_creators && data.top_creators.length > 0) {
        setRecommendations(data.top_creators);
      } else {
        setError(data.message || "No creators found for the given input.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-purple-400">
        Creator Recommendation System
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Brand Budget (USD):</label>
            <input
              type="number"
              name="brand_budget_usd"
              value={formData.brand_budget_usd}
              onChange={handleChange}
              required
              min={0}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country:</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Category:</label>
            <input
              type="text"
              name="product_category"
              value={formData.product_category}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Views Required:</label>
            <input
              type="number"
              name="min_views_required"
              value={formData.min_views_required}
              onChange={handleChange}
              required
              min={0}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Top Creator Recommendations:</h3>
            <ol className="space-y-4 list-decimal pl-5">
              {recommendations.map((creator, idx) => (
                <li key={idx} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <p><strong>{creator.youtuber}</strong></p>
                  <p>💰 Predicted Earning: ${creator.predicted_earning.toLocaleString()}</p>
                  <p>👥 Subscribers: {creator.subscribers.toLocaleString()}</p>
                  <p>▶️ Video Views: {creator.video_views.toLocaleString()}</p>
                  <p>🌍 Country: {creator.country}</p>
                  <p>📦 Category: {creator.channel_type}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandCreatorRecommender;
