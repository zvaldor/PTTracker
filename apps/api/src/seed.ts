import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@pttracker.com' },
    update: {},
    create: {
      email: 'demo@pttracker.com',
      passwordHash,
      locale: 'en',
      themePreference: 'system',
    },
  });

  console.log('Created demo user:', user.email);

  // Create settings
  await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      weekStartsOn: 'mon',
      enableCategories: true,
      enableDifficulty: true,
      enableDesire: true,
      difficultyMode: 'tshirt',
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Work',
        color: '#3b82f6',
        isEnabled: true,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Personal',
        color: '#8b5cf6',
        isEnabled: true,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Health',
        color: '#10b981',
        isEnabled: true,
      },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // Create demo tasks
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekday = today.getDay();

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Check emails',
        description: 'Review and respond to important emails',
        categoryId: categories[0].id,
        status: 'todo',
        weeklyDay: 1, // Monday
        lastPlannedKey: 'weekly:mon',
        difficultyTshirt: 'S',
        desire: 'med',
        isRecurring: true,
        recurringRule: {
          type: 'weekly',
          interval: 1,
          byWeekday: [1, 2, 3, 4, 5], // Weekdays
        },
        occurrencePerWeekEstimate: 5,
      },
      {
        userId: user.id,
        title: 'Morning workout',
        description: '30 minutes of exercise',
        categoryId: categories[2].id,
        status: 'todo',
        weeklyDay: weekday,
        lastPlannedKey: `weekly:${['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][weekday]}`,
        difficultyTshirt: 'M',
        desire: 'high',
        isRecurring: true,
        recurringRule: {
          type: 'weekly',
          interval: 1,
          byWeekday: [1, 3, 5], // Mon, Wed, Fri
        },
        occurrencePerWeekEstimate: 3,
      },
      {
        userId: user.id,
        title: 'Prepare presentation',
        description: 'Finish slides for Friday meeting',
        categoryId: categories[0].id,
        status: 'todo',
        plannedDate: todayStr,
        lastPlannedKey: `date:${todayStr}`,
        difficultyTshirt: 'L',
        desire: 'high',
        isRecurring: false,
      },
      {
        userId: user.id,
        title: 'Buy groceries',
        categoryId: categories[1].id,
        status: 'todo',
        difficultyTshirt: 'M',
        desire: 'med',
        isRecurring: false,
      },
      {
        userId: user.id,
        title: 'Team standup',
        description: 'Daily sync with the team',
        categoryId: categories[0].id,
        status: 'done',
        weeklyDay: weekday,
        lastPlannedKey: `weekly:${['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][weekday]}`,
        difficultyTshirt: 'S',
        desire: 'low',
        isRecurring: true,
        recurringRule: {
          type: 'weekly',
          interval: 1,
          byWeekday: [1, 2, 3, 4, 5],
        },
        occurrencePerWeekEstimate: 5,
        completedAt: new Date(),
      },
    ],
  });

  console.log('Created demo tasks');
  console.log('Demo account: demo@pttracker.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
