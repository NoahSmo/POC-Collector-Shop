import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Seed Roles/Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@collector.shop' },
    update: {
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User'
    },
    create: {
      email: 'admin@collector.shop',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@collector.shop' },
    update: {
      password: hashedPassword,
      role: 'user',
      name: 'Jane Collector'
    },
    create: {
      email: 'user@collector.shop',
      name: 'Jane Collector',
      password: hashedPassword,
      role: 'user',
    },
  });

  // 2. Seed Vintage Products from POC
  const products = [
    { id: '1', title: 'Typewriter Underwood', year: '1920', price: '€850', image: '/typewriter_hero.png', description: 'The Underwood No. 5 launched in 1900 has been described as "the first truly modern typewriter". This Typewriter was made in 1920 year, but working by this time.' },
    { id: '2', title: 'Vintage Gold Watch', year: '1955', price: '€1,200', image: '/vintage_watch.png', description: 'A luxury 1950s gold vintage pocket watch. Ornate details and in perfect working condition.' },
    { id: '3', title: 'Antique Bellows Camera', year: '1934', price: '€450', image: '/vintage_camera.png', description: 'A professional 1930s Kodak bellows camera. A gorgeous display piece for any collector.' },
    { id: '4', title: 'Antique Rotary Phone', year: '1925', price: '€240', image: 'https://images.unsplash.com/photo-1557180295-76eee20ae8aa?q=80&w=800&auto=format&fit=crop', description: 'Beautifully restored rotary dial telephone. Has been converted to work on modern landline networks.' },
    { id: '5', title: 'Classic Movie Projector', year: '1942', price: '€680', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', description: 'A vintage 8mm movie projector. Fully restored and aesthetic.' },
    { id: '6', title: 'Vintage World Map', year: '1890', price: '€320', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop', description: 'Authentic 19th century world map with wood frame.' },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { id: productData.id },
      update: { 
        ...productData,
        sellerId: adminUser.id 
      },
      create: { 
        ...productData, 
        sellerId: adminUser.id 
      },
    });
    console.log(`Created/Updated product with id: ${product.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
