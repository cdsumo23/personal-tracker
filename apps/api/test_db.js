const { PrismaClient } = require('@prisma/client');

async function test() {
  const urls = [
    'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
    'postgresql://postgres:admin@localhost:5432/postgres?schema=public',
    'postgresql://postgres:password@localhost:5432/postgres?schema=public',
    'postgresql://postgres:root@localhost:5432/postgres?schema=public',
    'postgresql://postgres@localhost:5432/postgres?schema=public',
  ];

  for (const url of urls) {
    console.log(`Testing: ${url}`);
    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    });

    try {
      await prisma.$connect();
      console.log(`SUCCESS: Connected using ${url}`);
      await prisma.$disconnect();
      return url;
    } catch (err) {
      console.log(`FAILED: ${err.message.split('\n')[0]}`);
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log('All connection attempts failed.');
  return null;
}

test();
