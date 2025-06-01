// File: src/pages/business/BusinessDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareText } from 'lucide-react';

export default function BusinessDashboard() {
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    country: '',
    platform: '',
  });
  const [options, setOptions] = useState({
    categories: [],
    countries: [],
    platforms: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    price: '',
    deliverables: '',
    creatorId: null,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/creators', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = response.data;
        setCreators(data);
        setFilteredCreators(data);

        // Extract dropdown options
        const categories = [...new Set(data.map((c) => c.category).filter(Boolean))];
        const countries = [...new Set(data.map((c) => c.country).filter(Boolean))];
        const platforms = [...new Set(data.flatMap((c) => c.platforms).filter(Boolean))];

        setOptions({ categories, countries, platforms });
        setLoading(false);
      } catch (err) {
        setError('Failed to load creators');
        setLoading(false);
      }
    };

    fetchCreators();
  }, [user.token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...creators];

    if (filters.category) {
      filtered = filtered.filter((c) => c.category === filters.category);
    }

    if (filters.country) {
      filtered = filtered.filter((c) => c.country === filters.country);
    }

    if (filters.platform) {
      filtered = filtered.filter((c) => c.platforms?.includes(filters.platform));
    }

    setFilteredCreators(filtered);
  };

  const startChat = async (creatorId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat/start',
        { creator_id: creatorId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      navigate(`/chat/${response.data.session_id}`);
    } catch (err) {
      alert('Failed to start chat session');
    }
  };

  const openConfirmationForm = (creatorId) => {
    setConfirmationData({
      price: '',
      deliverables: '',
      creatorId: creatorId,
    });
    setShowConfirmationForm(true);
  };

// In BusinessDashboard.js
const handleSendConfirmation = async () => {
  if (!confirmationData.price || !confirmationData.deliverables) {
    setError('Please fill all fields');
    return;
  }

  try {
    // Find the selected creator
    const creator = filteredCreators.find(
      (c) => c.id === confirmationData.creatorId
    );

    // Prepare email content
    const emailBody = `
      Hi ${creator.name},
      
      This is to confirm the deal with the following details:
      
      Amount: ${confirmationData.price}
      Deliverables: ${confirmationData.deliverables}
      
      Best regards,
      ${user.business_name || user.name}
    `;

    // Send email request with only subject and body
    await axios.post('http://localhost:5000/send-confirmation-email', {
      subject: 'Deal Confirmation - AbhiyanSetu',
      body: emailBody,
  });

    alert('Confirmation sent successfully');
    setShowConfirmationForm(false);
  } catch (err) {
    setError('Failed to send confirmation email');
    console.error(err);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading creators...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="">All Categories</option>
            {options.categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            name="country"
            value={filters.country}
            onChange={handleFilterChange}
            className="bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="">All Countries</option>
            {options.countries.map((country, idx) => (
              <option key={idx} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            name="platform"
            value={filters.platform}
            onChange={handleFilterChange}
            className="bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="">All Platforms</option>
            {options.platforms.map((plat, idx) => (
              <option key={idx} value={plat}>
                {plat}
              </option>
            ))}
          </select>

          <button
            onClick={applyFilters}
            className="col-span-1 sm:col-span-3 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-all duration-300"
          >
            Apply Filters
          </button>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-6 shadow-lg hover:scale-105 transition-transform"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{creator.name}</h2>
                  <p className="text-purple-400">@{creator.channel_name}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {creator.category}
                  </span>
                  <span className="bg-pink-900/30 text-pink-300 px-3 py-1 rounded-full text-sm">
                    {creator.country}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-700/40 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">Subscribers</p>
                    <p className="font-bold text-white text-lg">
                      {creator.youtube_subscribers.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-700/40 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">30-Day Views</p>
                    <p className="font-bold text-white text-lg">
                      {creator.video_views_last_30_days.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {creator.platforms.map((platform, index) => (
                      <span
                        key={index}
                        className="bg-gray-700/40 text-white px-2 py-1 rounded text-xs"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => startChat(creator.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center"
                >
                  <MessageSquareText className="w-5 h-5 mr-2" />
                  Start Chat
                </button>

                <button
                  onClick={() => openConfirmationForm(creator.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium flex items-center justify-center"
                >
                  Send Confirmation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Form Modal */}
      {showConfirmationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800/90 rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Confirm Deal</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price
              </label>
              <input
                type="number"
                value={confirmationData.price}
                onChange={(e) =>
                  setConfirmationData((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deliverables
              </label>
              <textarea
                value={confirmationData.deliverables}
                onChange={(e) =>
                  setConfirmationData((prev) => ({
                    ...prev,
                    deliverables: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmationForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConfirmation}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
              >
                Send Confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}