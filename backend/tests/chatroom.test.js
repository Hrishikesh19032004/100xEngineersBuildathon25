// tests/chatroom.test.js
const request = require('supertest');
const app = require('../server');

describe('Chatroom Functionality', () => {
  let businessToken;
  let creatorToken;
  let businessUserId;
  let creatorUserId;
  let chatroomId;

  beforeAll(async () => {
    // Create test users
    const businessSignup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'chatbusiness@example.com',
        password: 'password123',
        username: 'ChatBusiness',
        role: 'business'
      });

    const creatorSignup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'chatcreator@example.com',
        password: 'password123',
        username: 'ChatCreator',
        role: 'creator'
      });

    businessToken = businessSignup.body.token;
    creatorToken = creatorSignup.body.token;
    businessUserId = businessSignup.body.user.id;
    creatorUserId = creatorSignup.body.user.id;
  });

  describe('Business Dashboard', () => {
    it('should get business dashboard with creators list', async () => {
      const response = await request(app)
        .get('/api/business/dashboard')
        .set('Authorization', `Bearer ${businessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('creators');
      expect(response.body).toHaveProperty('chatrooms');
      expect(response.body).toHaveProperty('stats');
    });

    it('should initiate chat with creator', async () => {
      const response = await request(app)
        .post(`/api/business/initiate-chat/${creatorUserId}`)
        .set('Authorization', `Bearer ${businessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('chatroom');
      chatroomId = response.body.chatroom.id;
    });
  });

  describe('Creator Dashboard', () => {
    it('should get creator dashboard with chatrooms', async () => {
      const response = await request(app)
        .get('/api/creator/dashboard')
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('chatrooms');
      expect(response.body.chatrooms.length).toBeGreaterThan(0);
    });
  });

  describe('Messaging', () => {
    it('should send message from business to creator', async () => {
      const messageData = {
        chatroomId,
        content: 'Hello, I would like to discuss a project with you.'
      };

      const response = await request(app)
        .post('/api/message/send')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.message).toBe('Message sent successfully');
    });

    it('should send message from creator to business', async () => {
      const messageData = {
        chatroomId,
        content: 'Hi! I would be happy to help with your project.'
      };

      const response = await request(app)
        .post('/api/message/send')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.message).toBe('Message sent successfully');
    });

    it('should get chatroom messages', async () => {
      const response = await request(app)
        .get(`/api/chatroom/${chatroomId}`)
        .set('Authorization', `Bearer ${businessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('chatroom');
      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages.length).toBe(2);
    });

    it('should prevent unauthorized access to chatroom', async () => {
      // Create another user
      const unauthorizedUser = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'unauthorized@example.com',
          password: 'password123',
          username: 'Unauthorized',
          role: 'creator'
        });

      await request(app)
        .get(`/api/chatroom/${chatroomId}`)
        .set('Authorization', `Bearer ${unauthorizedUser.body.token}`)
        .expect(403);
    });
  });

  describe('ZegoCloud Integration', () => {
    it('should generate zego token for authorized user', async () => {
      const response = await request(app)
        .post('/api/zego/token')
        .set('Authorization', `Bearer ${businessToken}`)
        .send({ chatroomId })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('appId');
      expect(response.body).toHaveProperty('roomId');
      expect(response.body.roomId).toBe(`chatroom_${chatroomId}`);
    });

    it('should reject zego token for unauthorized user', async () => {
      const unauthorizedUser = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'unauth2@example.com',
          password: 'password123',
          username: 'Unauth2',
          role: 'business'
        });

      await request(app)
        .post('/api/zego/token')
        .set('Authorization', `Bearer ${unauthorizedUser.body.token}`)
        .send({ chatroomId })
        .expect(403);
    });
  });
});
