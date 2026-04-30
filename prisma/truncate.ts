import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg }     from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE user_achievements, user_stats, task_tags, task_time_blocks, time_blocks, tasks, tags, categories, achievements, priorities RESTART IDENTITY CASCADE'
  );
  console.log('✅ Truncate OK');
}

main()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());