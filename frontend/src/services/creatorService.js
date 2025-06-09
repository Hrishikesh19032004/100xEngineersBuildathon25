// src/services/creatorService.js
import api from '../api';

const CreatorService = {
  getDashboard: async () => {
    const response = await api.get('http://localhost:5000/api/creator/dashboard');
    return response.data;
  },
  
  getChatrooms: async () => {
    const response = await api.get('http://localhost:5000/api/creator/chatrooms');
    return response.data.chatrooms;
  }
};

export default CreatorService;