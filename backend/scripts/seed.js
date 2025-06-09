// scripts/seed.js
const { pool } = require('../config/database');
const User = require('../models/User');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Create sample business users
    const business1 = await User.create({
      email: 'business1@example.com',
      password: 'password123',
      username: 'TechCorp',
      role: 'business',
      profile: {
        company: 'Tech Corporation',
        industry: 'Technology',
        description: 'Leading tech company'
      }
    });

    const business2 = await User.create({
      email: 'business2@example.com',
      password: 'password123',
      username: 'DesignStudio',
      role: 'business',
      profile: {
        company: 'Creative Design Studio',
        industry: 'Design',
        description: 'Creative design solutions'
      }
    });

    // Create sample creator users
    const creator1 = await User.create({
      email: 'creator1@example.com',
      password: 'password123',
      username: 'ArtistJohn',
      role: 'creator',
      profile: {
        specialty: 'Digital Art',
        experience: '5 years',
        portfolio: 'https://portfolio.example.com',
        description: 'Professional digital artist'
      }
    });

    const creator2 = await User.create({
      email: 'creator2@example.com',
      password: 'password123',
      username: 'WriterSarah',
      role: 'creator',
      profile: {
        specialty: 'Content Writing',
        experience: '3 years',
        portfolio: 'https://writing-portfolio.example.com',
        description: 'Creative content writer'
      }
    });

    const creator3 = await User.create({
      email: 'creator3@example.com',
      password: 'password123',
      username: 'VideoMaker',
      role: 'creator',
      profile: {
        specialty: 'Video Production',
        experience: '7 years',
        portfolio: 'https://video-portfolio.example.com',
        description: 'Professional video creator'
      }
    });

    console.log('Sample users created successfully');
    console.log('Business users:', [business1.username, business2.username]);
    console.log('Creator users:', [creator1.username, creator2.username, creator3.username]);
    console.log('Seeding completed successfully');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
