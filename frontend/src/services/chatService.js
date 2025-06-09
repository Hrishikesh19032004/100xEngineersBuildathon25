// src/services/chatService.js
import api from '../api';

const ChatService = {
    getChatroom: async (id) => {
        const response = await api.get(`http://localhost:5000/api/chatroom/${id}`);
        return response.data.chatroom;
      },
      
      getMessages: async (id, offset = 0) => {
        const response = await api.get(`http://localhost:5000/api/chatroom/${id}/messages`, {
          params: { offset }
        });
        return response.data.messages;
      },
  
  sendMessage: async (chatroomId, content) => {
    const response = await api.post('http://localhost:5000/api/message/send', {
      chatroomId,
      content
    });
    return response.data.data;
  },
  
  markAsRead: async (chatroomId) => {
    await api.put(`http://localhost:5000/api/message/read/${chatroomId}`);
  },
  
  getUnreadCount: async (chatroomId) => {
    const response = await api.get(`http://localhost:5000/api/message/unread/${chatroomId}`);
    return response.data.unreadCount;
  }
};

export default ChatService;