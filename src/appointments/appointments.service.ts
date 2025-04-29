import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        doctor_id: createAppointmentDto.doctor_id,
        user_id: createAppointmentDto.user_id,
        date: new Date(createAppointmentDto.date),
        description: createAppointmentDto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        doctor: true,
        user: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        user: true,
      },
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        date: updateAppointmentDto.date
          ? new Date(updateAppointmentDto.date)
          : undefined,
      },
    });
  }

  async findByUserId(userId: number) {
    return this.prisma.appointment.findMany({
      where: { user_id: userId },
      include: {
        doctor: true,
        user: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
