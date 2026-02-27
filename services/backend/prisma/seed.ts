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

  // 2. Seed Vintage Products from POC (Translated to French)
  const products = [
    { 
      id: '1', 
      title: 'Machine à écrire Underwood', 
      year: '1920', 
      price: '€850', 
      image: '/typewriter_hero.png', 
      description: 'L\'Underwood No. 5, lancée en 1900, a été décrite comme "la première machine à écrire véritablement moderne". Cette machine a été fabriquée en 1920 et est toujours fonctionnelle aujourd\'hui.' 
    },
    { 
      id: '2', 
      title: 'Montre en or vintage', 
      year: '1955', 
      price: '€1,200', 
      image: '/vintage_watch.png', 
      description: 'Une luxueuse montre à gousset de poche en or des années 1950. Détails ornés et en parfait état de fonctionnement.' 
    },
    { 
      id: '3', 
      title: 'Appareil photo à soufflet antique', 
      year: '1934', 
      price: '€450', 
      image: '/vintage_camera.png', 
      description: 'Un appareil photo professionnel Kodak à soufflet des années 1930. Une magnifique pièce de collection pour toute exposition.' 
    },
    { 
      id: '4', 
      title: 'Téléphone à cadran rotatif vintage', 
      year: '1925', 
      price: '€240', 
      image: 'https://images.unsplash.com/photo-1557180295-76eee20ae8aa?q=80&w=800&auto=format&fit=crop', 
      description: 'Téléphone à cadran rotatif magnifiquement restauré. A été converti pour fonctionner sur les réseaux fixes modernes.' 
    },
    { 
      id: '5', 
      title: 'Projecteur de cinéma classique', 
      year: '1942', 
      price: '€680', 
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', 
      description: 'Un projecteur de film 8mm vintage. Entièrement restauré et très esthétique.' 
    },
    { 
      id: '6', 
      title: 'Carte du monde ancienne', 
      year: '1890', 
      price: '€320', 
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop', 
      description: 'Carte du monde authentique du XIXe siècle avec cadre en bois raffiné.' 
    },
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
