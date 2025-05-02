import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PdfGeneratorService } from 'src/shared/services/pdf.service';
import { AIService } from 'src/shared/services/ai.service';

@Module({
  providers: [RiskService, PdfGeneratorService, PrismaService, AIService],
  controllers: [RiskController],
})
export class RiskModule {}
