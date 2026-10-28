import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import Video from './models/Video.js';
import Comment from './models/Comment.js';

async function seed() {
  await connectDB();
  console.log('Clearing existing seed data...');
  await Promise.all([User.deleteMany({}), Video.deleteMany({}), Comment.deleteMany({})]);

  console.log('Creating demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const alice = await User.create({
    name: 'Alice Cooper',
    email: 'alice@vyntra.io',
    passwordHash,
  });

  const bob = await User.create({
    name: 'Bob Martin',
    email: 'bob@vyntra.io',
    passwordHash,
  });

  console.log('Creating demo videos...');
  const sampleVideos = [
    {
      owner: alice._id,
      title: 'Building Modern Responsive Web Apps with Vite & React',
      description: 'A deep dive into high-performance web engineering with React, modern state management, and Vite bundling.',
      category: 'Technology',
      tags: ['react', 'vite', 'javascript', 'frontend'],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      durationSec: 596,
      viewCount: 1420,
      likes: [bob._id],
      status: 'ready'
    },
    {
      owner: bob._id,
      title: 'Cinematic Drone Shots Across the Swiss Alps',
      description: 'Crisp 4K aerial shots of snowcapped peaks, valleys, and glaciers in the heart of Switzerland.',
      category: 'Travel',
      tags: ['travel', 'drone', 'cinematic', 'nature'],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
      durationSec: 653,
      viewCount: 3890,
      likes: [alice._id],
      status: 'ready'
    },
    {
      owner: alice._id,
      title: 'Mastering Unreal Engine 5: Lighting & Nanite Deep Dive',
      description: 'Explore Lumen real-time global illumination and virtualized micro-polygon geometry in Unreal Engine 5.',
      category: 'Gaming',
      tags: ['unrealengine', 'gamedev', 'graphics', 'gaming'],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      durationSec: 15,
      viewCount: 920,
      likes: [bob._id],
      status: 'ready'
    }
  ];

  const createdVideos = await Video.insertMany(sampleVideos);

  console.log('Adding demo comments...');
  await Comment.create({
    video: createdVideos[0]._id,
    user: bob._id,
    body: 'Fantastic explanation of Vite internals! Really helped clarify bundle splitting.'
  });

  await Comment.create({
    video: createdVideos[1]._id,
    user: alice._id,
    body: 'Those mountain peaks are breathtaking! What drone setup did you use for this?'
  });

  console.log('Database seeded successfully!');
  console.log('Demo accounts created:');
  console.log('  Email: alice@vyntra.io  |  Password: password123');
  console.log('  Email: bob@vyntra.io    |  Password: password123');
  await closeDB();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
