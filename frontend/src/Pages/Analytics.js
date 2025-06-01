// File: src/pages/business/Analytics.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Line,
  Bar,
  Pie,
  Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    expenses: [],
    profit: [],
    campaignPerformance: [],
    platformDistribution: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/analytics', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user.token]);

  // Revenue vs Expenses Line Chart
  const revenueExpensesData = {
    labels: analyticsData.revenue.map((item, index) => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsData.revenue.map(item => item.amount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Expenses',
        data: analyticsData.expenses.map(item => item.amount),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  // Profit Trend Line Chart
  const profitData = {
    labels: analyticsData.profit.map(item => item.month),
    datasets: [
      {
        label: 'Profit',
        data: analyticsData.profit.map(item => item.amount),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
    ],
  };

  // Campaign Performance Bar Chart
  const campaignData = {
    labels: analyticsData.campaignPerformance.map(item => item.campaign),
    datasets: [
      {
        label: 'Performance',
        data: analyticsData.campaignPerformance.map(item => item.performance),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  };

  // Platform Distribution Pie Chart
  const platformData = {
    labels: analyticsData.platformDistribution.map(item => item.platform),
    datasets: [
      {
        data: analyticsData.platformDistribution.map(item => item.percentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading analytics...</p>
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
        <h1 className="text-3xl font-bold mb-8">Marketing Analytics Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl">
            <h3 className="text-xl font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold mt-2">${analyticsData.totalRevenue}</p>
          </div>
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl">
            <h3 className="text-xl font-medium">Total Expenses</h3>
            <p className="text-3xl font-bold mt-2">${analyticsData.totalExpenses}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl">
            <h3 className="text-xl font-medium">Net Profit</h3>
            <p className="text-3xl font-bold mt-2">${analyticsData.netProfit}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl">
            <h3 className="text-xl font-medium">ROI</h3>
            <p className="text-3xl font-bold mt-2">{analyticsData.roi}%</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue vs Expenses */}
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">Revenue vs Expenses</h3>
            <Line data={revenueExpensesData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }} />
          </div>

          {/* Profit Trend */}
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">Profit Trend</h3>
            <Line data={profitData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }} />
          </div>

          {/* Campaign Performance */}
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">Campaign Performance</h3>
            <Bar data={campaignData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }} />
          </div>

          {/* Platform Distribution */}
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">Platform Distribution</h3>
            <Doughnut data={platformData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                },
              },
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}