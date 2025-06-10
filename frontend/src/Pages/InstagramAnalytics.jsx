import React, { useState } from 'react';
import { Search, Heart, MessageCircle, Eye, Users, Calendar, Hash, AtSign, TrendingUp, AlertCircle, Play, Info } from 'lucide-react';

const InstagramAnalytics = () => {
  const [postUrl, setPostUrl] = useState('https://www.instagram.com/p/DKLIH6PNIyM/?igsh=bHVmbnh2bHh6dGd2');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  // Extract shortcode from Instagram URL
  const extractPostShortcode = (url) => {
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract hashtags from text
  const extractHashtags = (text) => {
    if (!text) return [];
    const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g;
    return text.match(hashtagRegex) || [];
  };

  // Extract mentions from text
  const extractMentions = (text) => {
    if (!text) return [];
    const mentionRegex = /@[a-zA-Z0-9_.]+/g;
    return text.match(mentionRegex) || [];
  };

  // Calculate engagement rate
  const calculateEngagementRate = (likes, comments, followers) => {
    if (followers === 0) return 0;
    return ((likes + comments) / followers * 100).toFixed(2);
  };

  // Generate realistic demo data based on the URL
  const generateDemoData = (url) => {
    const shortcode = extractPostShortcode(url) || 'DKLIH6PNIyM';
    const demoCaption = "🌟 Just dropped our latest collection! What do you think? 💭✨ #fashion #style #newcollection #ootd #trendy #fashionista #shopping #love #instagood #photooftheday Thanks to @photographer_name for the amazing shots! 📸";
    
    // Generate semi-realistic numbers based on shortcode
    const seed = shortcode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseMultiplier = (seed % 1000) + 500;
    
    return {
      postId: `${seed * 1000}_${Date.now()}`,
      shortcode: shortcode,
      url: `https://www.instagram.com/p/${shortcode}/`,
      
      // Content Details
      caption: demoCaption,
      mediaType: seed % 3 === 0 ? 'Video' : seed % 2 === 0 ? 'Carousel' : 'Photo',
      mediaUrl: 'https://via.placeholder.com/400x400?text=Instagram+Post',
      
      // Engagement Metrics (realistic ranges)
      likes: Math.floor(baseMultiplier * (2 + (seed % 10))),
      comments: Math.floor(baseMultiplier * (0.1 + (seed % 3) * 0.1)),
      views: seed % 2 === 0 ? Math.floor(baseMultiplier * (3 + (seed % 15))) : 0,
      
      // User Info
      username: 'fashion_brand_official',
      userId: `${seed}_user`,
      userFullName: 'Fashion Brand Official',
      userFollowers: Math.floor(baseMultiplier * (50 + (seed % 100))),
      userFollowing: Math.floor(500 + (seed % 300)),
      userPosts: Math.floor(200 + (seed % 800)),
      
      // Post Metadata
      timestamp: Date.now() / 1000 - (seed % 100000),
      postedDate: new Date(Date.now() - (seed % 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      location: seed % 4 === 0 ? 'New York, NY' : seed % 3 === 0 ? 'Los Angeles, CA' : seed % 2 === 0 ? 'Miami, FL' : 'Not specified',
      
      // Content Analysis
      hashtags: extractHashtags(demoCaption),
      mentions: extractMentions(demoCaption),
      
      // Additional Info
      isCarousel: seed % 3 === 0,
      mediaCount: seed % 3 === 0 ? Math.floor(2 + (seed % 8)) : 1,
      isVerified: seed % 7 === 0,
      isPrivate: false
    };
  };

  // Parse API response data with multiple format support
  const parsePostData = (rawData, shortcode) => {
    console.log('Raw API Response:', rawData);
    
    // Handle different API response structures
    let post = null;
    
    if (rawData.data) {
      post = rawData.data;
    } else if (rawData.result) {
      post = rawData.result;
    } else if (rawData.graphql?.shortcode_media) {
      post = rawData.graphql.shortcode_media;
    } else if (rawData.items && rawData.items[0]) {
      post = rawData.items[0];
    } else if (rawData.media) {
      post = rawData.media;
    } else if (rawData[0]) {
      post = rawData[0];
    } else {
      post = rawData;
    }
    
    if (!post) {
      throw new Error('No post data found in API response');
    }

    // Extract caption text from various possible structures
    let captionText = '';
    if (post.edge_media_to_caption?.edges?.[0]?.node?.text) {
      captionText = post.edge_media_to_caption.edges[0].node.text;
    } else if (post.caption?.text) {
      captionText = post.caption.text;
    } else if (post.caption) {
      captionText = typeof post.caption === 'string' ? post.caption : '';
    } else if (post.text) {
      captionText = post.text;
    }

    // Extract user info from various possible structures
    const userInfo = post.owner || post.user || {};
    
    return {
      postId: post.id || post.pk || post.shortcode || 'N/A',
      shortcode: post.shortcode || shortcode,
      url: post.shortcode ? `https://www.instagram.com/p/${post.shortcode}/` : postUrl,
      
      // Content Details
      caption: captionText || 'No caption available',
      mediaType: post.__typename || post.media_type || (post.is_video ? 'Video' : 'Photo'),
      mediaUrl: post.display_url || post.thumbnail_url || post.image_versions2?.candidates?.[0]?.url || '',
      
      // Engagement Metrics
      likes: post.edge_media_preview_like?.count || post.like_count || post.likes || 0,
      comments: post.edge_media_to_comment?.count || post.comment_count || post.comments || 0,
      views: post.video_view_count || post.play_count || post.view_count || 0,
      
      // User Info - Multiple fallback options
      username: userInfo.username || post.username || 'Unknown',
      userId: userInfo.id || userInfo.pk || post.user_id || 'N/A',
      userFullName: userInfo.full_name || userInfo.name || post.full_name || 'N/A',
      userFollowers: userInfo.edge_followed_by?.count || userInfo.follower_count || userInfo.followers || 0,
      userFollowing: userInfo.edge_follow?.count || userInfo.following_count || userInfo.following || 0,
      userPosts: userInfo.edge_owner_to_timeline_media?.count || userInfo.media_count || userInfo.posts || 0,
      
      // Post Metadata
      timestamp: post.taken_at_timestamp || post.taken_at || post.created_time || Date.now() / 1000,
      postedDate: new Date((post.taken_at_timestamp || post.taken_at || post.created_time || Date.now() / 1000) * 1000).toLocaleDateString(),
      location: post.location?.name || post.location || 'Not specified',
      
      // Content Analysis
      hashtags: extractHashtags(captionText),
      mentions: extractMentions(captionText),
      
      // Additional Info
      isCarousel: post.__typename === 'GraphSidecar' || post.media_type === 'carousel_album' || post.carousel_media_count > 1,
      mediaCount: post.edge_sidecar_to_children?.edges?.length || post.carousel_media_count || 1,
      isVerified: userInfo.is_verified || false,
      isPrivate: userInfo.is_private || false
    };
  };

  // Enhanced Instagram API fetcher with your specific API
  const fetchInstagramAnalytics = async () => {
    const shortcode = extractPostShortcode(postUrl);
    
    if (!shortcode) {
      throw new Error('Invalid Instagram post URL. Please enter a valid Instagram post URL.');
    }

    console.log('Extracted shortcode:', shortcode);

    // API configurations to try with your specific endpoint
    const API_CONFIGS = [
      {
        url: 'https://instagram-scraper-ai1.p.rapidapi.com/post-info',
        params: {
          shortcode: shortcode
        }
      },
      {
        url: 'https://instagram-scraper-ai1.p.rapidapi.com/post',
        params: {
          url: postUrl
        }
      },
      {
        url: 'https://instagram-scraper-ai1.p.rapidapi.com/media',
        params: {
          shortcode: shortcode
        }
      }
    ];

    // Try each endpoint
    for (const config of API_CONFIGS) {
      try {
        const params = new URLSearchParams(config.params);
        const fullUrl = `${config.url}?${params}`;
        
        console.log('Trying API endpoint:', fullUrl);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'a791236fe0mshb2f6fac5d4530b9p1e66a4jsn9b16be70a5d0',
            'x-rapidapi-host': 'instagram-scraper-ai1.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Success! Data:', data);
          
          // Check if we got real data
          if (data && (data.data || data.result || data.success !== false)) {
            return parsePostData(data, shortcode);
          } else {
            console.log('Empty or error response from API');
          }
        } else {
          const errorText = await response.text();
          console.log('API Error Response:', response.status, errorText);
        }
      } catch (err) {
        console.log('Fetch error:', err.message);
        continue;
      }
    }

    // If all API attempts fail, throw error
    throw new Error('Unable to fetch Instagram data from the API. The post may be private, deleted, or there might be an API issue. Please try again with a different public post.');
  };

  // Handle button click
  const handleFetchAnalytics = async (e) => {
    e.preventDefault();
    
    if (!postUrl.trim()) {
      setError('Please enter an Instagram post URL');
      return;
    }

    // Validate URL format
    if (!postUrl.includes('instagram.com/p/') && !postUrl.includes('instagram.com/reel/') && !postUrl.includes('instagram.com/tv/')) {
      setError('Please enter a valid Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)');
      return;
    }

    setLoading(true);
    setError('');
    setAnalytics(null);
    setDemoMode(false);

    try {
      const result = await fetchInstagramAnalytics();
      setAnalytics(result);
      setError('');
    } catch (err) {
      console.error('Analytics fetch error:', err);
      
      // If it's an API limitation, show demo data instead of just an error
      if (err.message.includes('authentication') || err.message.includes('demo')) {
        const demoData = generateDemoData(postUrl);
        setAnalytics(demoData);
        setDemoMode(true);
        setError('');
      } else {
        setError(err.message);
        setAnalytics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle demo button click
  const handleShowDemo = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const demoData = generateDemoData(postUrl);
      setAnalytics(demoData);
      setDemoMode(true);
      setLoading(false);
    }, 1500);
  };

  // Metric Card Component
  const MetricCard = ({ icon: Icon, title, value, color = "text-gray-600" }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Instagram Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Analyze Instagram post performance and engagement metrics
          </p>
        </div>

        {/* API Information Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Now Using Real Instagram API!</p>
              <p className="mt-1">This tool now connects to a working Instagram scraper API. You can analyze real public Instagram posts.</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Works with public Instagram posts, reels, and carousels</li>
                <li>Get real engagement metrics and user data</li>
                <li>Private or deleted posts will show an error</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="postUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Post URL
              </label>
              <input
                type="url"
                id="postUrl"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/DKLIH6PNIyM/"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleFetchAnalytics(e)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleFetchAnalytics}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? 'Analyzing...' : 'Get Real Analytics'}</span>
              </button>
              <button
                onClick={handleShowDemo}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Show Demo (if API fails)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-600">
              {demoMode ? 'Generating demo analytics...' : 'Fetching Instagram analytics...'}
            </p>
            {!demoMode && (
              <p className="mt-1 text-sm text-gray-500">Trying Instagram APIs...</p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-sm mt-2">Try the "Show Demo Analytics" button to see how the tool works!</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {analytics && (
          <div className="space-y-6">
            {/* Demo/Success Message */}
            <div className={`${demoMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
              <p className={`${demoMode ? 'text-blue-700' : 'text-green-700'} font-medium`}>
                {demoMode ? '🔮 Demo Analytics Generated!' : '✅ Real Instagram data fetched successfully!'}
              </p>
              {demoMode && (
                <p className="text-blue-600 text-sm mt-1">
                  This shows realistic sample data based on your URL. In production, this would be real Instagram metrics.
                </p>
              )}
            </div>

            {/* User Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">@{analytics.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{analytics.userFullName}</p>
                </div>
                {analytics.isVerified && (
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="font-medium text-blue-600">✓ Verified</p>
                  </div>
                )}
                {analytics.isPrivate && (
                  <div>
                    <p className="text-sm text-gray-600">Privacy</p>
                    <p className="font-medium text-yellow-600">🔒 Private Account</p>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Engagement Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={Heart}
                  title="Likes"
                  value={analytics.likes.toLocaleString()}
                  color="text-red-500"
                />
                <MetricCard
                  icon={MessageCircle}
                  title="Comments"
                  value={analytics.comments.toLocaleString()}
                  color="text-blue-500"
                />
                <MetricCard
                  icon={Eye}
                  title="Views"
                  value={analytics.views > 0 ? analytics.views.toLocaleString() : 'N/A'}
                  color="text-green-500"
                />
                <MetricCard
                  icon={TrendingUp}
                  title="Engagement Rate"
                  value={`${calculateEngagementRate(analytics.likes, analytics.comments, analytics.userFollowers)}%`}
                  color="text-purple-500"
                />
              </div>
            </div>

            {/* Audience Insights */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Audience Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                  icon={Users}
                  title="Followers"
                  value={analytics.userFollowers.toLocaleString()}
                  color="text-indigo-500"
                />
                <MetricCard
                  icon={Users}
                  title="Following"
                  value={analytics.userFollowing.toLocaleString()}
                  color="text-teal-500"
                />
                <MetricCard
                  icon={Calendar}
                  title="Total Posts"
                  value={analytics.userPosts.toLocaleString()}
                  color="text-orange-500"
                />
              </div>
            </div>

            {/* Content Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Content Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Hash className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Hashtags ({analytics.hashtags.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analytics.hashtags.length > 0 ? (
                      analytics.hashtags.slice(0, 10).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No hashtags found</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <AtSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Mentions ({analytics.mentions.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analytics.mentions.length > 0 ? (
                      analytics.mentions.slice(0, 10).map((mention, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {mention}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No mentions found</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Post Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Posted Date:</span>
                  <span className="ml-2 font-medium">{analytics.postedDate}</span>
                </div>
                <div>
                  <span className="text-gray-600">Media Type:</span>
                  <span className="ml-2 font-medium">{analytics.mediaType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{analytics.location}</span>
                </div>
                <div>
                  <span className="text-gray-600">Post ID:</span>
                  <span className="ml-2 font-medium font-mono text-xs">{analytics.postId.toString().substring(0, 20)}...</span>
                </div>
                {analytics.isCarousel && (
                  <div>
                    <span className="text-gray-600">Media Count:</span>
                    <span className="ml-2 font-medium">{analytics.mediaCount} items</span>
                  </div>
                )}
              </div>
            </div>

            {/* Caption Preview */}
            {analytics.caption && analytics.caption !== 'No caption available' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Caption</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {analytics.caption.length > 500 
                    ? `${analytics.caption.substring(0, 500)}...` 
                    : analytics.caption
                  }
                </p>
              </div>
            )}

            {/* Implementation Guide */}
            {demoMode && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">🚀 Implementation Guide</h3>
                <div className="text-sm text-indigo-800 space-y-2">
                  <p className="font-medium">To make this work with real Instagram data:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Set up Instagram Basic Display API or Instagram Graph API</li>
                    <li>Implement server-side authentication</li>
                    <li>Handle API rate limits and permissions</li>
                    <li>Add proper error handling for different post types</li>
                    <li>Consider using webhooks for real-time updates</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramAnalytics;