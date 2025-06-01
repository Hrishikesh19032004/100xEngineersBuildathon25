import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';

const Outreach = () => {
  const [formData, setFormData] = useState({
    brandName: '',
    brandEmail: '',
    productName: '',
    campaignGoals: '',
    budget: '',
    timeline: '',
    specialNotes: '',
    creatorEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Outreach form submitted:', formData);
    alert('Outreach email would be sent here!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 pt-20">
      <div className="max-w-lg w-full">
        <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg inline-block mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Outreach Request</h2>
            <p className="text-gray-400">Fill in the details to contact a creator</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium mb-2">Brand Name</label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Your Brand"
              />
            </div>

            <div>
              <label htmlFor="brandEmail" className="block text-sm font-medium mb-2">Brand Email</label>
              <input
                type="email"
                id="brandEmail"
                name="brandEmail"
                value={formData.brandEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="contact@brand.com"
              />
            </div>

            <div>
              <label htmlFor="productName" className="block text-sm font-medium mb-2">Product / Service</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Product Name"
              />
            </div>

            <div>
              <label htmlFor="campaignGoals" className="block text-sm font-medium mb-2">Campaign Goals</label>
              <textarea
                id="campaignGoals"
                name="campaignGoals"
                value={formData.campaignGoals}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Describe your campaign objectives..."
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium mb-2">Budget</label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Budget Amount"
              />
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium mb-2">Timeline (optional)</label>
              <input
                type="text"
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., 1 month"
              />
            </div>

            <div>
              <label htmlFor="specialNotes" className="block text-sm font-medium mb-2">Special Notes (optional)</label>
              <textarea
                id="specialNotes"
                name="specialNotes"
                value={formData.specialNotes}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Any additional details or requests..."
              />
            </div>
            <div>
              <label htmlFor="creatorEmail" className="block text-sm font-medium mb-2">Creator Email</label>
              <input
                type="email"
                id="creatorEmail"
                name="creatorEmail"
                value={formData.creatorEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="creator@example.com"
              />
            </div>


            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center"
            >
              Send Outreach Email
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Outreach;
