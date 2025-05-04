import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({ where: { id: 1 }, data: { gender: 'Male' } });

  console.log(
    '✔ Seed завершён: пользователи, клиники, услуги и врачи созданы',
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
