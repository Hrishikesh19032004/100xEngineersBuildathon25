import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Users, Eye, DollarSign, MapPin, Tag, TrendingUp, CheckCircle, X, RefreshCw, Info, AlertCircle } from "lucide-react";

const Recommendation = ({ requirements, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCreators, setSelectedCreators] = useState(new Set());
  const [parsedRequirements, setParsedRequirements] = useState(null);
  const [availableOptions, setAvailableOptions] = useState({ countries: [], categories: [] });
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);

  // Enhanced natural language processing
  const enhancedParseRequirements = (text) => {
    const parsed = {
      brand_budget_usd: 10000,
      country: "United States",
      product_category: "Entertainment",
      min_views_required: 50000,
      creators_count: 5
    };

    const lowerText = text.toLowerCase();

    // Extract budget with multiple patterns
    const budgetPatterns = [
      /budget.*?\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)?/i,
      /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)?/i,
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)?\s*(?:dollars?|usd|\$)/i,
      /spend.*?(\d+(?:,\d+)*(?:\.\d+)?)/i,
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*budget/i
    ];

    for (const pattern of budgetPatterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        if (match[0].toLowerCase().includes('k') || match[0].toLowerCase().includes('thousand')) {
          amount *= 1000;
        }
        parsed.brand_budget_usd = amount;
        break;
      }
    }

    // Extract number of creators
    const creatorPatterns = [
      /(\d+)\s*(?:creators?|influencers?|people)/i,
      /need\s*(\d+)/i,
      /find\s*(?:me\s*)?(\d+)/i,
      /get\s*(?:me\s*)?(\d+)/i,
      /want\s*(\d+)/i
    ];

    for (const pattern of creatorPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsed.creators_count = parseInt(match[1]);
        break;
      }
    }

    // Extract views requirement
    const viewsPatterns = [
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|m|million)?\s*(?:views?|reach|audience)/i,
      /minimum.*?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|m|million)?/i,
      /at least.*?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|m|million)?/i
    ];

    for (const pattern of viewsPatterns) {
      const match = text.match(pattern);
      if (match) {
        let views = parseFloat(match[1].replace(/,/g, ''));
        if (match[0].toLowerCase().includes('k') || match[0].toLowerCase().includes('thousand')) {
          views *= 1000;
        } else if (match[0].toLowerCase().includes('m') || match[0].toLowerCase().includes('million')) {
          views *= 1000000;
        }
        parsed.min_views_required = views;
        break;
      }
    }

    // Enhanced country detection
    const countryKeywords = {
      'us': 'United States', 'usa': 'United States', 'america': 'United States',
      'united states': 'United States', 'uk': 'United Kingdom', 'britain': 'United Kingdom',
      'england': 'United Kingdom', 'india': 'India', 'canada': 'Canada',
      'australia': 'Australia', 'germany': 'Germany', 'france': 'France',
      'japan': 'Japan', 'brazil': 'Brazil', 'mexico': 'Mexico',
      'italy': 'Italy', 'spain': 'Spain', 'south korea': 'South Korea',
      'korea': 'South Korea', 'china': 'China', 'russia': 'Russia',
      'netherlands': 'Netherlands', 'sweden': 'Sweden', 'norway': 'Norway'
    };

    for (const [keyword, country] of Object.entries(countryKeywords)) {
      if (lowerText.includes(keyword)) {
        parsed.country = country;
        break;
      }
    }

    // Enhanced category detection
    const categoryKeywords = {
      'sports': 'Sports', 'fitness': 'Sports', 'nike': 'Sports', 'adidas': 'Sports',
      'workout': 'Sports', 'gym': 'Sports', 'athletic': 'Sports',
      'fashion': 'Fashion', 'style': 'Fashion', 'clothing': 'Fashion',
      'outfit': 'Fashion', 'design': 'Fashion',
      'beauty': 'Beauty', 'makeup': 'Beauty', 'skincare': 'Beauty',
      'cosmetics': 'Beauty', 'hair': 'Beauty',
      'tech': 'Technology', 'technology': 'Technology', 'gadgets': 'Technology',
      'software': 'Technology', 'hardware': 'Technology', 'ai': 'Technology',
      'gaming': 'Gaming', 'games': 'Gaming', 'esports': 'Gaming',
      'streaming': 'Gaming', 'twitch': 'Gaming',
      'food': 'Food', 'cooking': 'Food', 'recipes': 'Food',
      'restaurant': 'Food', 'chef': 'Food',
      'travel': 'Travel', 'tourism': 'Travel', 'adventure': 'Travel',
      'vacation': 'Travel', 'trip': 'Travel',
      'lifestyle': 'Lifestyle', 'vlog': 'Lifestyle', 'daily': 'Lifestyle',
      'life': 'Lifestyle', 'routine': 'Lifestyle',
      'music': 'Music', 'songs': 'Music', 'artist': 'Music',
      'singer': 'Music', 'band': 'Music',
      'education': 'Education', 'learning': 'Education', 'tutorial': 'Education',
      'teaching': 'Education', 'course': 'Education',
      'entertainment': 'Entertainment', 'comedy': 'Entertainment', 'funny': 'Entertainment',
      'film': 'Entertainment', 'movie': 'Entertainment'
    };

    for (const [keyword, category] of Object.entries(categoryKeywords)) {
      if (lowerText.includes(keyword)) {
        parsed.product_category = category;
        break;
      }
    }

    return parsed;
  };

  // Load available options
  const loadAvailableOptions = async () => {
    try {
      const [countriesRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:5000/countries"),
        fetch("http://localhost:5000/categories")
      ]);
      
      if (countriesRes.ok && categoriesRes.ok) {
        const countries = await countriesRes.json();
        const categories = await categoriesRes.json();
        setAvailableOptions({
          countries: countries.countries || [],
          categories: categories.categories || []
        });
      }
    } catch (error) {
      console.warn("Could not load available options:", error);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setDebugInfo(null);
    setRetryCount(prev => prev + 1);

    try {
      // Parse requirements locally for immediate feedback
      const localParsed = enhancedParseRequirements(requirements);
      setParsedRequirements(localParsed);

      // Try both methods: structured data and text parsing
      const payloads = [
        // Method 1: Send structured data
        {
          brand_budget_usd: localParsed.brand_budget_usd,
          country: localParsed.country,
          product_category: localParsed.product_category,
          min_views_required: localParsed.min_views_required,
          creators_count: localParsed.creators_count
        },
        // Method 2: Send raw text for backend processing (if method 1 fails)
        {
          requirements_text: requirements
        }
      ];

      let response = null;
      let lastError = null;

      // Try structured data first
      for (let i = 0; i < payloads.length; i++) {
        try {
          console.log(`Trying method ${i + 1}:`, payloads[i]);
          
          response = await fetch("http://localhost:5000/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloads[i]),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Success with method", i + 1, data);
            
            // Store parsed requirements from backend if available
            if (data.parsed_requirements) {
              setParsedRequirements(data.parsed_requirements);
            }

            if (data.top_creators && data.top_creators.length > 0) {
              setRecommendations(data.top_creators);
              setDebugInfo({
                method: i + 1,
                totalFound: data.total_found || data.top_creators.length,
                message: data.message
              });
              return; // Success, exit function
            } else {
              // No creators found, but request was successful
              setError(data.message || "No creators found for the given requirements.");
              setDebugInfo({
                method: i + 1,
                totalFound: 0,
                message: data.message,
                availableOptions: data.available_options
              });
              return;
            }
          } else {
            const errorData = await response.json();
            lastError = errorData.error || `HTTP ${response.status}`;
            console.log(`Method ${i + 1} failed:`, lastError);
          }
        } catch (err) {
          lastError = err.message;
          console.log(`Method ${i + 1} error:`, err.message);
        }
      }

      // If we get here, all methods failed
      throw new Error(lastError || "All request methods failed");

    } catch (err) {
      console.error("Final error:", err);
      setError(err.message || "Failed to connect to recommendation service");
      setDebugInfo({
        error: err.message,
        parsedLocally: parsedRequirements
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  useEffect(() => {
    if (requirements) {
      fetchRecommendations();
    }
  }, [requirements]);

  const toggleCreatorSelection = (creatorIndex) => {
    const newSelected = new Set(selectedCreators);
    if (newSelected.has(creatorIndex)) {
      newSelected.delete(creatorIndex);
    } else {
      newSelected.add(creatorIndex);
    }
    setSelectedCreators(newSelected);
  };

  const handleSendConfirmation = () => {
    const selectedCreatorsList = recommendations.filter((_, index) => 
      selectedCreators.has(index)
    );
    
    if (selectedCreatorsList.length === 0) {
      alert("Please select at least one creator to send confirmation.");
      return;
    }

    console.log("Sending confirmation to:", selectedCreatorsList);
    alert(`Confirmation sent to ${selectedCreatorsList.length} creator(s)!`);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const handleRetry = () => {
    fetchRecommendations();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Creator Recommendations</h2>
              <p className="text-purple-100 text-sm mb-2">Request: "{requirements}"</p>
              
              {/* Show parsed requirements */}
              {parsedRequirements && (
                <div className="bg-white/10 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="font-semibold">Parsed Requirements:</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-purple-100">
                    <div>Budget: ${formatNumber(parsedRequirements.budget || parsedRequirements.brand_budget_usd)}</div>
                    <div>Country: {parsedRequirements.country}</div>
                    <div>Category: {parsedRequirements.category || parsedRequirements.product_category}</div>
                    <div>Min Views: {formatNumber(parsedRequirements.min_views || parsedRequirements.min_views_required)}</div>
                    <div>Count: {parsedRequirements.creators_count}</div>
                  </div>
                </div>
              )}

              {/* Debug info */}
              {debugInfo && (
                <div className="bg-white/5 rounded-lg p-2 text-xs mt-2">
                  <div className="flex items-center gap-2 text-purple-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>Debug: Method {debugInfo.method} used</span>
                    {debugInfo.totalFound !== undefined && <span>• Found {debugInfo.totalFound} total</span>}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <span className="ml-4 text-white text-lg">Finding perfect creators for you... (Attempt {retryCount})</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
              <h3 className="font-semibold mb-2">No Creators Found</h3>
              <p className="mb-4">{error}</p>
              
              {availableOptions.countries.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Available Countries ({availableOptions.countries.length}):</h4>
                  <div className="text-xs bg-red-900/30 p-2 rounded max-h-24 overflow-y-auto">
                    {availableOptions.countries.slice(0, 20).join(', ')}
                    {availableOptions.countries.length > 20 && '...'}
                  </div>
                </div>
              )}
              
              {availableOptions.categories.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Available Categories ({availableOptions.categories.length}):</h4>
                  <div className="text-xs bg-red-900/30 p-2 rounded max-h-24 overflow-y-auto">
                    {availableOptions.categories.slice(0, 20).join(', ')}
                    {availableOptions.categories.length > 20 && '...'}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <>
              <div className="mb-4 bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">
                  Found {recommendations.length} Matching Creators
                  {debugInfo?.totalFound && debugInfo.totalFound > recommendations.length && 
                    ` (showing top ${recommendations.length} of ${debugInfo.totalFound})`
                  }
                </h3>
                <p className="text-gray-300 text-sm">
                  Select creators to send campaign confirmations. Earnings are ML-predicted based on your budget and requirements.
                </p>
              </div>

              <div className="grid gap-4 mb-6">
                {recommendations.map((creator, index) => (
                  <div
                    key={index}
                    className={`bg-gray-700 rounded-lg p-4 border transition-all ${
                      selectedCreators.has(index)
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedCreators.has(index)}
                            onChange={() => toggleCreatorSelection(index)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <h4 className="text-xl font-bold text-white">
                            {creator.youtuber || creator.name || `Creator ${index + 1}`}
                          </h4>
                          <div className="flex items-center gap-1 bg-green-900/50 px-2 py-1 rounded text-green-200 text-sm">
                            <DollarSign className="w-4 h-4" />
                            <span>${(creator.predicted_earning || creator.predicted_cost || 0).toFixed(0)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">
                              {formatNumber(creator.subscribers)} subscribers
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">
                              {formatNumber(creator.video_views)} views
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span className="text-gray-300">{creator.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">{creator.channel_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-600">
                <button
                  onClick={handleSendConfirmation}
                  disabled={selectedCreators.size === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                    selectedCreators.size > 0
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  Send Confirmation to {selectedCreators.size} Creator(s)
                </button>
                <button
                  onClick={() => setSelectedCreators(new Set(recommendations.map((_, i) => i)))}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedCreators(new Set())}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Clear Selection
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendation;