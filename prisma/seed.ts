import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    include: { doctors: true },
  });
  const clinics = await prisma.clinic.findMany();

  const specialties = [
    'Кардиолог',
    'Дерматолог',
    'Педиатр',
    'Ортопед',
    'Невролог',
    'Гинеколог',
    'Психотерапевт',
    'Офтальмолог',
    'Терапевт',
    'Стоматолог',
  ];
  const firstNames = [
    'Иван',
    'Анна',
    'Олег',
    'Мария',
    'Дмитрий',
    'Елена',
    'Алексей',
    'Наталья',
    'Сергей',
    'Оксана',
  ];
  const lastNames = [
    'Иванов',
    'Петрова',
    'Сидоров',
    'Кузнецова',
    'Попов',
    'Соколова',
    'Морозов',
    'Лебедева',
    'Волков',
    'Федорова',
  ];

  for (const service of services) {
    if (service.doctors.length === 0) {
      console.log(`Создаём врача для услуги: ${service.name}`);

      const randomFirstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName =
        lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomSpecialty =
        specialties[Math.floor(Math.random() * specialties.length)];
      const randomClinic = clinics[Math.floor(Math.random() * clinics.length)];

      // Создать нового доктора
      const newDoctor = await prisma.doctor.create({
        data: {
          name: `${randomFirstName} ${randomLastName}`,
          specialty: randomSpecialty,
          photo: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
          review_count: Math.floor(Math.random() * 100),
          experience: `${Math.floor(Math.random() * 40) + 1} лет`,
          education: ['МГУ им. Ломоносова', 'СПбГМУ им. Павлова'],
          languages: ['Русский', 'Английский'],
          clinic_id: randomClinic.id,
          schedule: {
            Понедельник: '09:00-17:00',
            Вторник: '09:00-17:00',
            Среда: '09:00-17:00',
            Четверг: '09:00-17:00',
            Пятница: '09:00-16:00',
            Суббота: 'Выходной',
            Воскресенье: 'Выходной',
          },
          price: `${Math.floor(Math.random() * 4000) + 1000} руб.`,
          accepts_insurance: ['ВТБ', 'Согаз', 'Ингосстрах'],
          about: `Доктор ${randomFirstName} ${randomLastName} — опытный специалист.`,
          services: {
            connect: { id: service.id },
          },
        },
      });

      console.log(
        `Создан доктор ${newDoctor.name} и привязан к услуге ${service.name}`,
      );
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
