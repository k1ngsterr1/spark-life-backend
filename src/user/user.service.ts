import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WeeklyStatisticDto } from './dto/weekly-statistic.dto';
import { format, parse } from 'date-fns';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async createUser(data: RegisterDto) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        first_name: data.first_name,
        last_name: data.last_name,
        patronymic: data.patronymic,
        med_doc: data.med_doc,
        diseases: data.diseases,
        password: hashedPassword,
      },
    });
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const bcrypt = await import('bcryptjs');
    const isMatch = bcrypt.compare(data.new_password, user.password);
    if (isMatch) {
      throw new HttpException('New password must not match old password', 400);
    }
    const hashedPassword = await bcrypt.hash(data.new_password, 10);
    return await this.prisma.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
      },
    });
  }
  async findByIdentifier(identifier: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  async updateUserProfile(userId: number, data: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: data,
      select: {
        id: true,
        email: true,
        phone: true,
        first_name: true,
        last_name: true,
        patronymic: true,
        gender: true,
        age: true,
        height: true,
        weight: true,
      },
    });
  }
  async addWeeklyStatistic(userId: number, data: WeeklyStatisticDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        weekly_sleep: true,
        weekly_water: true,
      },
    });

    const today = format(new Date(), 'dd.MM.yyyy');

    const sortByDate = (a: { date: string }, b: { date: string }) => {
      const dateA = parse(a.date, 'dd.MM.yyyy', new Date());
      const dateB = parse(b.date, 'dd.MM.yyyy', new Date());
      return dateA.getTime() - dateB.getTime();
    };

    const sleep_schedule: { date: string; sleep: number }[] = Array.isArray(
      user.weekly_sleep,
    )
      ? (user.weekly_sleep as any)
      : [];

    const water_schedule: { date: string; water: number }[] = Array.isArray(
      user.weekly_water,
    )
      ? (user.weekly_water as any)
      : [];

    if (data.sleep !== undefined) {
      sleep_schedule.push({ date: today, sleep: data.sleep });
    }

    if (data.water !== undefined) {
      water_schedule.push({ date: today, water: data.water });
    }

    const sorted_sleep_schedule = sleep_schedule.sort(sortByDate).slice(-7);
    const sorted_water_schedule = water_schedule.sort(sortByDate).slice(-7);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        weekly_sleep: sorted_sleep_schedule as Prisma.JsonValue,
        weekly_water: sorted_water_schedule as Prisma.JsonValue,
      },
    });
  }
  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const bcrypt = await import('bcryptjs');

    return await bcrypt.compare(password, hashedPassword);
  }
  async getMe(userId: number) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }
}
