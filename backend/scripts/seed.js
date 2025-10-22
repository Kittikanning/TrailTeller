import { db } from '../src/db/index.js';
import { destinations } from '../src/db/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedDestinations = async () => {
  try {
    console.log('🌱 Seeding destinations...');

    await db.insert(destinations).values([
      {
        name: 'Tokyo',
        location: 'Japan',
        category: 'city',
        avg_cost: '5000',
        description: 'Modern metropolis with rich culture and history',
        image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
      },
      {
        name: 'Bali',
        location: 'Indonesia',
        category: 'beach',
        avg_cost: '3000',
        description: 'Tropical paradise with beautiful beaches and temples',
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'
      },
      {
        name: 'Swiss Alps',
        location: 'Switzerland',
        category: 'mountain',
        avg_cost: '8000',
        description: 'Stunning mountain landscapes and skiing',
        image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7'
      },
      {
        name: 'Paris',
        location: 'France',
        category: 'city',
        avg_cost: '6000',
        description: 'The city of love, art, and fashion',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
      },
      {
        name: 'Maldives',
        location: 'Maldives',
        category: 'beach',
        avg_cost: '10000',
        description: 'Luxury tropical island resort destination',
        image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8'
      },
      {
        name: 'New York',
        location: 'USA',
        category: 'city',
        avg_cost: '7000',
        description: 'The city that never sleeps',
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'
      },
      {
        name: 'Santorini',
        location: 'Greece',
        category: 'beach',
        avg_cost: '6500',
        description: 'Beautiful white buildings and blue domes',
        image_url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e'
      },
      {
        name: 'Chiang Mai',
        location: 'Thailand',
        category: 'city',
        avg_cost: '2000',
        description: 'Cultural capital with temples and nature',
        image_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648'
      },
      {
        name: 'Iceland',
        location: 'Iceland',
        category: 'mountain',
        avg_cost: '9000',
        description: 'Land of fire and ice with stunning landscapes',
        image_url: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927'
      },
      {
        name: 'Dubai',
        location: 'UAE',
        category: 'city',
        avg_cost: '8500',
        description: 'Luxury shopping and modern architecture',
        image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'
      }
    ]);

    console.log('✅ Destinations seeded successfully!');
    console.log('📊 Total destinations added: 10');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed function
seedDestinations();