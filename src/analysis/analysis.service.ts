import { Injectable } from '@nestjs/common';
import { AIService } from 'src/shared/services/ai.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  async diagnoseFromImage(userId: number, file: Express.Multer.File) {
    const filename = `${Date.now()}-${file.originalname}`;
    const saveDir = path.join(__dirname, '../../uploads');
    const savePath = path.join(saveDir, filename);

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // ✅ Копируем файл с диска
    fs.copyFileSync(file.path, savePath);

    const imageUrl = `${process.env.BASE_URL}/uploads/${filename}`;

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

  async getHistory(userId: number) {
    return this.prisma.medicalAnalysis.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}
