// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  const doctors = await prisma.doctor.findMany();

  // Карта соответствий специальностей к услугам
  const specialtyServiceMap: { [key: string]: string[] } = {
    Кардиолог: ['Приём кардиолога', 'Кардиологический скрининг', 'УЗИ сердца'],
    Дерматолог: ['Приём дерматолога', 'Удаление родинок', 'Лазерная терапия'],
    Педиатр: ['Детский приём', 'Иммунизация детей', 'Школьный медосмотр'],
    Ортопед: ['Ортопедический осмотр', 'Восстановление после травм'],
    Невролог: ['Приём невролога', 'ЭЭГ', 'Терапия боли'],
    Гинеколог: ['Гинекологический осмотр', 'Пренатальный осмотр'],
    Психотерапевт: ['Психотерапевтическая консультация', 'Лечение депрессии'],
    Офтальмолог: ['Осмотр офтальмолога', 'Проверка зрения'],
    Терапевт: ['Общий медосмотр', 'Функциональная диагностика'],
    Стоматолог: [
      'Чистка зубов',
      'Удаление зубов',
      'Лечение кариеса',
      'Ортодонтическая консультация',
    ],
  };

  // Проходим по каждому доктору
  for (const doctor of doctors) {
    const matchedServiceNames = specialtyServiceMap[doctor.specialty] || [];

    // Находим услуги по именам
    const matchedServices = services.filter((service) =>
      matchedServiceNames.includes(service.name),
    );

    if (matchedServices.length > 0) {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: {
          services: {
            connect: matchedServices.map((service) => ({ id: service.id })),
          },
        },
      });
    }
  }
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
