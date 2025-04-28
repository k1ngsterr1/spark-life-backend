import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateServiceDto) {
    return this.prisma.service.create({ data });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [services, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.service.count(),
    ]);

    return {
      data: services,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.service.delete({ where: { id } });
  }
}
