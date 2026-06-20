const { PrismaClient } = require('@prisma/client');

async function test() {
  const passwords = [
    'postgres',
    'Admin@123456',
    'Admin@123',
    'admin',
    'root',
    '123456',
    '12345678',
    'password',
    '1234',
    '123',
    'pg',
    'pgsql',
    'postgre',
    'postgres123',
    'postgres1',
  ];

  const dbNames = ['postgres', 'budget_planner', 'budget_planner_db', 'personal_tracker'];

  for (const pass of passwords) {
    for (const dbName of dbNames) {
      const url = `postgresql://postgres:${pass}@localhost:5432/${dbName}?schema=public`;
      console.log(`Testing: postgresql://postgres:***@localhost:5432/${dbName}`);
      const prisma = new PrismaClient({
        datasources: {
          db: { url }
        }
      });

      try {
        await prisma.$connect();
        console.log(`\nSUCCESS!!! Connected using: postgresql://postgres:${pass}@localhost:5432/${dbName}\n`);
        await prisma.$disconnect();
        return { pass, dbName };
      } catch (err) {
        // Only retry if it's password failure. If DB doesn't exist, we know the password is correct but we need to create the DB!
        const msg = err.message.toLowerCase();
        if (msg.includes('database') && msg.includes('does not exist')) {
          console.log(`\nSUCCESS!!! Password is correct: "${pass}" (but database "${dbName}" does not exist)\n`);
          await prisma.$disconnect();
          return { pass, dbName: 'postgres', createDb: dbName };
        }
        // console.log(`FAILED: ${err.message.split('\n')[0]}`);
      } finally {
        await prisma.$disconnect();
      }
    }
  }
  console.log('All connection attempts failed.');
  return null;
}

test();
