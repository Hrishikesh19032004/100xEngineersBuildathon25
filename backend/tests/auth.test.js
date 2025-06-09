
const request = require('supertest');
const app = require('../server');

describe('Authentication Endpoints', () => {
  let businessToken;
  let creatorToken;

  describe('POST /api/auth/signup', () => {
    it('should create a new business user', async () => {
      const userData = {
        email: 'testbusiness@example.com',
        password: 'password123',
        username: 'TestBusiness',
        role: 'business',
        profile: { company: 'Test Corp' }
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('business');
      businessToken = response.body.token;
    });

    it('should create a new creator user', async () => {
      const userData = {
        email: 'testcreator@example.com',
        password: 'password123',
        username: 'TestCreator',
        role: 'creator',
        profile: { specialty: 'Test Art' }
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('creator');
      creatorToken = response.body.token;
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'testbusiness@example.com',
        password: 'password123',
        username: 'AnotherBusiness',
        role: 'business'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'testbusiness@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'testbusiness@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${businessToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('testbusiness@example.com');
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });
});