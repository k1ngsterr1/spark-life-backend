import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AIService } from 'src/shared/services/ai.service';
import { PdfGeneratorService } from 'src/shared/services/pdf.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RiskService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

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
      height: user.height?.toNumber() || null,
      weight: user.weight?.toNumber() || null,
      diseases: user.diseases,
    };

    const pdfPath = await this.pdfService.generateRiskReport(
      userId,
      userDataForPdf,
      {
        risk_score: riskData.risk_score,
        risk_level: riskData.risk_level,
        risk_category: riskData.risk_category,
        risk_factors: riskData.risk_factors,
        summary: riskData.summary,
        recommendations: riskData.recommendations,
        follow_up_tests: riskData.follow_up_tests,
        generated_at: new Date().toISOString(),
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

  async listRiskReports(userId: number): Promise<string[]> {
    // ensure directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      throw new Error('No reports directory found');
    }

    const files = await fs.promises.readdir(this.uploadsDir);
    const re = new RegExp(`^medical_report_${userId}_[0-9]+\\.pdf$`);

    // filter + sort by timestamp embedded in the name
    const matched = files
      .filter((f) => re.test(f))
      .sort((a, b) => {
        const ta = parseInt(a.match(/_(\d+)\.pdf$/)![1], 10);
        const tb = parseInt(b.match(/_(\d+)\.pdf$/)![1], 10);
        return tb - ta; // newest first
      });

    if (matched.length === 0) {
      throw new Error('No risk reports found for this user');
    }
    return matched;
  }

  async getRiskReport(userId: number): Promise<{ filename: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        riskProfile: {
          select: { updated_at: true },
        },
      },
    });

    if (!user?.riskProfile) {
      throw new Error('Risk profile not found. Please generate it first.');
    }

    // match the name of the file you generate in PdfGeneratorService:
    const filename = `medical_report_${userId}_${user.riskProfile.updated_at.getTime()}.pdf`;
    return { filename };
  }
}
