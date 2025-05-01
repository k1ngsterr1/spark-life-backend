import { Module } from '@nestjs/common';
import { DentalCheckService } from './dental-check.service';
import { DentalCheckController } from './dental-check.controller';
import { PrismaService } from 'src/shared/services/prisma.service';
import { AIService } from 'src/shared/services/ai.service';

@Module({
  controllers: [DentalCheckController],
  providers: [DentalCheckService, PrismaService, AIService],
})
export class DentalCheckModule {}
