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
    // Сохраняем изображение во временное хранилище (например, public/analysis-images)
    const filename = `${Date.now()}-${file.originalname}`;
    const saveDir = path.join(__dirname, '../../public/analysis-images');
    const savePath = path.join(saveDir, filename);

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    fs.writeFileSync(savePath, file.buffer);

    // Генерируем публичный URL (должен совпадать с baseUrl клиента)
    const imageUrl = `${process.env.BASE_URL}/uploads/analysis-images/${filename}`;

    // Теперь передаём корректный imageUrl в AIService
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
