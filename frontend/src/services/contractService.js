// src/services/contractService.js
import api from '../api';

const ContractService = {
  getContractsForChatroom: async (chatroomId) => {
    try {
      const response = await api.get(`http://localhost:5000/api/contract/chatroom/${chatroomId}/contracts`);
      return { contracts: response.data.contracts };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }
};

export default ContractService;