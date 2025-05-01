import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { AIService } from 'src/shared/services/ai.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, AIService, PrismaService],
})
export class AnalysisModule {}
