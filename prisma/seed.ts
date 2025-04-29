// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { id: 1 },
    data: {
      weekly_water: [
        { date: '28.04.2025', water: 2.3 },
        { date: '27.05.2025', water: 1.8 },
      ],
      weekly_sleep: [
        { date: '28.04.2025', sleep: 2 },
        { date: '27.05.2025', sleep: 8 },
      ],
    },
  });
}

main()
  .then(async () => {
    console.log('Данные успешно заполнены!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
