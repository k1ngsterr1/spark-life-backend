import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDoctorDto) {
    return this.prisma.doctor.create({ data });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [doctors, total] = await this.prisma.$transaction([
      this.prisma.doctor.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { clinic: true },
      }),
      this.prisma.doctor.count(),
    ]);

    return {
      data: doctors,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.doctor.findUnique({
      where: { id },
      include: { clinic: true },
    });
  }

  async update(id: number, data: UpdateDoctorDto) {
    return this.prisma.doctor.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}
