import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg }     from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

const DEFAULT_CATEGORIES = [
  { name: 'Travail',       color: '#2470BD', icon: 'briefcase' },
  { name: 'Personnel',     color: '#27ae60', icon: 'user'      },
  { name: 'Santé',         color: '#e74c3c', icon: 'heart'     },
  { name: 'Apprentissage', color: '#9b59b6', icon: 'book'      },
  { name: 'Sport',         color: '#e67e22', icon: 'activity'  },
];

async function seedPriorities() {
  await prisma.priority.createMany({
    data: [
      { label: 'Critique', level: 4, color: '#E24B4A', icon: 'flame',      xpMultiplier: 2.00 },
      { label: 'Haute',    level: 3, color: '#EF9F27', icon: 'arrow-up',   xpMultiplier: 1.50 },
      { label: 'Normale',  level: 2, color: '#378ADD', icon: 'minus',      xpMultiplier: 1.00 },
      { label: 'Faible',   level: 1, color: '#1D9E75', icon: 'arrow-down', xpMultiplier: 0.75 },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Priorités seedées');
}

async function seedAchievements() {
  await prisma.achievement.createMany({
    data: [
      {
        name:           'Premier pas',
        description:    'Complète ta première tâche',
        icon:           'star',
        xpBonus:        10,
        conditionType:  'TASKS_COMPLETED',
        conditionValue: 1,
      },
      {
        name:           'En route',
        description:    '10 tâches complétées',
        icon:           'rocket',
        xpBonus:        25,
        conditionType:  'TASKS_COMPLETED',
        conditionValue: 10,
      },
      {
        name:           'Productif',
        description:    '50 tâches complétées',
        icon:           'zap',
        xpBonus:        75,
        conditionType:  'TASKS_COMPLETED',
        conditionValue: 50,
      },
      {
        name:           'Machine',
        description:    '100 tâches complétées',
        icon:           'cpu',
        xpBonus:        150,
        conditionType:  'TASKS_COMPLETED',
        conditionValue: 100,
      },
      {
        name:           'Première flamme',
        description:    'Streak de 3 jours',
        icon:           'flame',
        xpBonus:        15,
        conditionType:  'STREAK',
        conditionValue: 3,
      },
      {
        name:           'En feu',
        description:    'Streak de 7 jours',
        icon:           'fire',
        xpBonus:        50,
        conditionType:  'STREAK',
        conditionValue: 7,
      },
      {
        name:           'Inarrêtable',
        description:    'Streak de 30 jours',
        icon:           'trophy',
        xpBonus:        200,
        conditionType:  'STREAK',
        conditionValue: 30,
      },
      {
        name:           'Montée en puissance',
        description:    'Atteindre le niveau 5',
        icon:           'trending',
        xpBonus:        100,
        conditionType:  'LEVEL_REACHED',
        conditionValue: 5,
      },
      {
        name:           'Élite',
        description:    'Atteindre le niveau 10',
        icon:           'crown',
        xpBonus:        500,
        conditionType:  'LEVEL_REACHED',
        conditionValue: 10,
      },
      {
        name:           "Gagneur d'XP",
        description:    'Accumuler 500 XP',
        icon:           'coins',
        xpBonus:        50,
        conditionType:  'XP_EARNED',
        conditionValue: 500,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Achievements seedés');
}

async function seedCategories() {
  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await prisma.category.findFirst({
      where: { name: cat.name },
    });

    if (!exists) {
      await prisma.category.create({
        data: {
          name:  cat.name,
          color: cat.color,
          icon:  cat.icon,
        },
      });
    }
  }

  console.log('✅ Catégories seedées');
}

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  await seedPriorities();
  await seedAchievements();
  await seedCategories();

  console.log('\n🎉 Seed terminé avec succès');
}

main()
  .catch(e => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());