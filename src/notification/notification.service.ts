import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/shared/services/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { format, isAfter, parse } from 'date-fns';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.notification.count(),
    ]);

    return {
      data: notifications,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return await this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return await this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.notification.delete({
      where: { id },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotificationsCron() {
    const now = new Date();
    const formattedTime = format(now, 'HH:mm'); // текущее время в формате "HH:mm"
    const today = format(now, 'dd.MM.yyyy'); // текущее число в формате "dd.MM.yyyy"
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfMonth = now.getDate(); // 1-31

    const notifications = await this.prisma.notification.findMany({
      where: {
        time: formattedTime,
      },
    });

    for (const notification of notifications) {
      const notificationEndDate = parse(
        notification.end_date,
        'dd.MM.yyyy',
        new Date(),
      );

      // end_date >= today
      if (
        isAfter(notificationEndDate, now) ||
        format(notificationEndDate, 'dd.MM.yyyy') === today
      ) {
        if (this.isNotificationDue(notification.type, dayOfWeek, dayOfMonth)) {
          console.log(`Sending notification to user ${notification.user_id}`);
          this.notificationGateway.sendNewNotification(
            notification.user_id,
            notification,
          );
        }
      }
    }
  }

  private isNotificationDue(
    type: string,
    dayOfWeek: number,
    dayOfMonth: number,
  ): boolean {
    switch (type) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Понедельник-пятница
      case 'weekly':
        return dayOfWeek === 1; // Понедельник
      case 'monthly':
        return dayOfMonth === 1; // Первое число месяца
      default:
        return false;
    }
  }
}
