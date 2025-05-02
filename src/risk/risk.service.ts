import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AIService } from 'src/shared/services/ai.service';
import { PdfGeneratorService } from 'src/shared/services/pdf.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RiskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
    private readonly pdfService: PdfGeneratorService,
  ) {}

  async calculateRiskProfile(
    userId: number,
  ): Promise<{ riskData: any; pdfPath: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        skinChecks: {
          orderBy: { check_datetime: 'desc' },
          take: 1,
          select: {
            risk_description: true,
            risk_level: true,
          },
        },
        anxietyChecks: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            summary: true,
            anxiety_level: true,
          },
        },
        medicalAnalyses: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            result: true,
          },
        },
        riskProfile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const riskData = await this.aiService.generateRiskProfile(userId);

    const userDataForPdf = {
      age: user.age,
      height: user.height?.toNumber() || null, // Convert Decimal to number
      weight: user.weight?.toNumber() || null, // Convert Decimal to number
      diseases: user.diseases,
    };

    const pdfPath = await this.pdfService.generateRiskReport(
      userId,
      userDataForPdf,
      {
        risk_score: riskData.risk_score,
        risk_factors: riskData.risk_factors,
      },
    );

    // 5. Update or create risk profile
    await this.prisma.riskProfile.upsert({
      where: { user_id: userId },
      update: {
        risk_score: riskData.risk_score,
        risk_factors: riskData.risk_factors as Prisma.JsonArray,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        risk_score: riskData.risk_score,
        risk_factors: riskData.risk_factors as Prisma.JsonArray,
      },
    });

    return {
      riskData,
      pdfPath,
    };
  }

  async getRiskReport(userId: number): Promise<{ pdfPath: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        riskProfile: {
          select: {
            updated_at: true,
          },
        },
      },
    });

    if (!user?.riskProfile) {
      throw new Error('Risk profile not found. Please generate it first.');
    }

    // Construct the path based on your storage pattern
    const pdfPath = `reports/risk_report_${userId}_${user.riskProfile.updated_at.getTime()}.pdf`;

    return { pdfPath };
  }
}
