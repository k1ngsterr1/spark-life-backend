import { Module } from '@nestjs/common';
import { AppointmentController } from './appointments.controller';
import { AppointmentService } from './appointments.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, PrismaService],
})
export class AppointmentModule {}
