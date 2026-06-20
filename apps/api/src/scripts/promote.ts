import prisma from '../config/database';

async function main() {
  const args = process.argv.slice(2);
  let email = '';

  for (const arg of args) {
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    }
  }

  // Fallback to positional argument if no --email= was provided
  if (!email && args[0] && !args[0].startsWith('--')) {
    email = args[0];
  }

  if (!email) {
    console.error('❌ Error: Please provide an email address.');
    console.log('Usage:');
    console.log('  Local development: npm run promote-admin <email>');
    console.log('  Production server: node dist/scripts/promote.js <email>');
    process.exit(1);
  }

  console.log(`Connecting to database to promote user: ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`ℹ️ User "${email}" is already an ADMIN.`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`✅ Success: User "${email}" has been successfully promoted to ADMIN.`);
    console.log(`   User Details:`);
    console.log(`   - ID: ${updatedUser.id}`);
    console.log(`   - Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`   - New Role: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
