import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Box,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import BusinessService from '../services/businessService';

function BusinessDashboard() {
  const [creators, setCreators] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await BusinessService.getDashboard();
        setCreators(data.creators);
        setChatrooms(data.chatrooms);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const startChat = async (creatorId) => {
    try {
      const chatroom = await BusinessService.initiateChat(creatorId);
      navigate(`/chat/${chatroom.id}`);
    } catch (error) {
      console.error('Failed to initiate chat', error);
    }
  };

  const filteredCreators = creators
    .filter((creator) =>
      creator.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filterBy === 'subscribers') {
        return (b.profile?.subscribers || 0) - (a.profile?.subscribers || 0);
      } else if (filterBy === 'views') {
        return (b.profile?.views || 0) - (a.profile?.views || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="w-screen h-screen overflow-auto p-4 bg-gray-50">
      <Typography variant="h4" gutterBottom>
        Business Dashboard
      </Typography>

      {/* 🔍 Search and Filter */}
      <Box display="flex" gap={2} my={3} flexWrap="wrap">
        <TextField
          variant="outlined"
          label="Search creators"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <TextField
          select
          label="Sort by"
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="default">Default</MenuItem>
          <MenuItem value="subscribers">Most Subscribers</MenuItem>
          <MenuItem value="views">Most Views</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {/* 👤 Creator List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Available Creators
          </Typography>
          <Grid container spacing={2}>
            {filteredCreators.length > 0 ? (
              filteredCreators.map((creator) => (
                <Grid item xs={12} sm={6} key={creator.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          src={creator.profile?.avatar}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6">{creator.username}</Typography>
                          <Typography color="textSecondary">
                            {creator.profile?.specialty || 'Creator'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" paragraph>
                        {creator.profile?.description || 'No description available'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        👥 {creator.profile?.subscribers || 0} subscribers • 👁 {creator.profile?.views || 0} views
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ChatIcon />}
                        onClick={() => startChat(creator.id)}
                        sx={{ mt: 1 }}
                      >
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body1" sx={{ pl: 2 }}>
                No creators found.
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* 💬 Active Chats */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Active Chats
          </Typography>
          {chatrooms.length > 0 ? (
            chatrooms.map((chatroom) => (
              <Card
                key={chatroom.id}
                sx={{ mb: 2, cursor: 'pointer' }}
                onClick={() => navigate(`/chat/${chatroom.id}`)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={chatroom.creator_profile?.avatar}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{chatroom.creator_username}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Last activity: {new Date(chatroom.updated_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No active chats
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default BusinessDashboard;
