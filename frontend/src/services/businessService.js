// src/services/businessService.js
import api from '../api';

const BusinessService = {
  getDashboard: async () => {
    const response = await api.get('http://localhost:5000/api/business/dashboard');
    return response.data;
  },
  
  getCreators: async () => {
    const response = await api.get('http://localhost:5000/api/business/creators');
    return response.data.creators;
  },
  
  initiateChat: async (creatorId) => {
    const response = await api.post(`http://localhost:5000/api/business/initiate-chat/${creatorId}`);
    return response.data.chatroom;
  },
  
  getChatrooms: async () => {
    const response = await api.get('http://localhost:5000/api/business/chatrooms');
    return response.data.chatrooms;
  }
};

export default BusinessService;