import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClinicDto) {
    return this.prisma.clinic.create({ data });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [clinics, total] = await this.prisma.$transaction([
      this.prisma.clinic.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { doctors: true, services: true },
      }),
      this.prisma.clinic.count(),
    ]);

    return {
      data: clinics,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.clinic.findUnique({
      where: { id },
      include: { doctors: true, services: true },
    });
  }

  async update(id: string, data: UpdateClinicDto) {
    return this.prisma.clinic.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.clinic.delete({
      where: { id },
    });
  }
}
