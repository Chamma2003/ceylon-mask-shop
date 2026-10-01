const mongoose = require('mongoose');
require('dotenv').config();

const Mask = require('./models/Mask');
const Review = require('./models/Review');

const initialMasks = [
  {
    maskId: 'gurulu',
    title: 'Gurulu Raksha (Eagle)',
    category: 'protection',
    categoryLabel: 'Protection & Wealth',
    price: 'LKR 24,500',
    priceAmount: 24500,
    dimensions: '18" x 12" x 6"',
    aura: 'Drives away toxic influences, brings authority & wealth',
    imgSrc: 'assets/gurulu_raksha.png',
    description: 'The Gurulu (Eagle) Raksha is one of the most prominent Sri Lankan masks. In local folklore, Gurulu is a mythical bird of prey that protects human dwellings from toxic pests, black magic, and general ill-fortune. Hand-carved with large expansive wings, it stands as a guard of wealth and strength.'
  },
  {
    maskId: 'mayura',
    title: 'Mayura Raksha (Peacock)',
    category: 'prosperity',
    categoryLabel: 'Peace & Fortune',
    price: 'LKR 22,000',
    priceAmount: 22000,
    dimensions: '16" x 10" x 5"',
    aura: 'Invites peaceful friendships, wards off negative thoughts',
    imgSrc: 'assets/mayura_raksha.png',
    description: 'Adorned with detailed representations of peacock tail feathers, the Mayura (Peacock) Raksha represents grace, charm, and harmony. It is believed to bring peaceful relationships and positive opportunities to those who keep it displayed in their household.'
  },
  {
    maskId: 'ginijal',
    title: 'Ginijal Raksha (Fire Devil)',
    category: 'protection',
    categoryLabel: 'Energy & Fire',
    price: 'LKR 26,000',
    priceAmount: 26000,
    dimensions: '17" x 11" x 6"',
    aura: 'Cleanses negative energy, ignites focus and motivation',
    imgSrc: 'assets/hero_mask.png',
    description: 'Surrounded by stylized shapes of raging flames, the Ginijal (Fire Devil) Raksha is a symbol of power, vigor, and purification. It is historically used in dances to banish malice and bad spirits from villages, making it a perfect protective centerpiece for home walls.'
  }
];

const initialReviews = [
  {
    maskId: 'gurulu',
    maskTitle: 'Gurulu Raksha (Eagle)',
    reviewerName: 'Dr. Klaus Weber',
    location: 'Munich, Germany',
    rating: 5,
    comment: 'An extraordinary masterpiece of traditional craftsmanship! The intricate carving on the Kaduru wood and the depth of the natural pigments are captivating. It arrived securely packed in Germany.'
  },
  {
    maskId: 'mayura',
    maskTitle: 'Mayura Raksha (Peacock)',
    reviewerName: 'Elena Rostova',
    location: 'London, UK',
    rating: 5,
    comment: 'The Mayura Raksha mask brings such vibrant energy and peace to our living room. You can feel the decades of family heritage embedded into every wooden detail.'
  },
  {
    maskId: 'ginijal',
    maskTitle: 'Ginijal Raksha (Fire Devil)',
    reviewerName: 'Marcus Sterling',
    location: 'Sydney, Australia',
    rating: 5,
    comment: 'A magnificent centerpiece for my private collection of global cultural artifacts. Handcrafted perfection directly from the master carvers of Ambalangoda.'
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ceylon_mask';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    console.log('Clearing existing mask & review collections...');
    await Mask.deleteMany({});
    await Review.deleteMany({});

    console.log('Seeding initial mask data...');
    await Mask.insertMany(initialMasks);

    console.log('Seeding initial customer reviews...');
    await Review.insertMany(initialReviews);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
