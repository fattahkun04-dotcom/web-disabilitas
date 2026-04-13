/**
 * Script untuk deploy database ke production
 * Jalankan setelah set DATABASE_URL ke production database
 * 
 * Usage:
 *   npm run db:deploy
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.production' });

async function deployDatabase() {
  console.log('🚀 Starting database deployment...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL not found in environment');
    console.error('Please set DATABASE_URL in .env.production file');
    process.exit(1);
  }

  console.log('📦 Step 1: Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client');
    process.exit(1);
  }

  console.log('\n🔄 Step 2: Pushing database schema to production...');
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to push database schema');
    process.exit(1);
  }

  console.log('\n✅ Database deployment completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Deploy to Vercel');
  console.log('   2. Test your application');
  console.log('   3. Monitor logs in Vercel dashboard');
}

deployDatabase();
