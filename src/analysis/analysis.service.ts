import { Injectable } from '@nestjs/common';
import { AIService } from 'src/shared/services/ai.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  async diagnoseFromImage(userId: number, imageUrl: string) {
    const result = await this.aiService.diagnoseFromAnalysisImage(
      userId,
      imageUrl,
    );

    const saved = await this.prisma.medicalAnalysis.create({
      data: {
        user_id: userId,
        image_url: imageUrl,
        result,
      },
    });

    return saved;
  }
}
