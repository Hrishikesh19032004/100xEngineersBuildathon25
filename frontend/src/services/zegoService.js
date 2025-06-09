// src/services/zegoService.js
import api from '../api';

const ZegoService = {
  generateToken: async (chatroomId) => {
    const response = await api.post('http://localhost:5000/api/zego/token', { chatroomId });
    return response.data;
  }
};

export default ZegoService;