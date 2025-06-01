// File: backend/routes/analytics.js
const express = require('express');
const router = express.Router();

// Mock analytics data - replace with actual database queries
const mockAnalyticsData = {
  revenue: [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 15000 },
    { month: 'Mar', amount: 18000 },
    { month: 'Apr', amount: 21000 },
    { month: 'May', amount: 25000 },
  ],
  expenses: [
    { month: 'Jan', amount: 8000 },
    { month: 'Feb', amount: 9000 },
    { month: 'Mar', amount: 10000 },
    { month: 'Apr', amount: 11000 },
    { month: 'May', amount: 13000 },
  ],
  profit: [
    { month: 'Jan', amount: 4000 },
    { month: 'Feb', amount: 6000 },
    { month: 'Mar', amount: 8000 },
    { month: 'Apr', amount: 10000 },
    { month: 'May', amount: 12000 },
  ],
  campaignPerformance: [
    { campaign: ' Summer Campaign', performance: 85 },
    { campaign: 'Winter Campaign', performance: 72 },
    { campaign: 'Autumn Campaign', performance: 91 },
    { campaign: 'Christmas Campaign', performance: 68 },
  ],
  platformDistribution: [
    { platform: 'Instagram', percentage: 35 },
    { platform: 'YouTube', percentage: 25 },
    { platform: 'TikTok', percentage: 20 },
    { platform: 'Facebook', percentage: 15 },
    { platform: 'Twitter', percentage: 5 },
  ],
  totalRevenue: 91000,
  totalExpenses: 51000,
  netProfit: 40000,
  roi: 78,
};

router.get('/', (req, res) => {
  try {
    // In a real application, replace this with actual database queries
    res.json(mockAnalyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;