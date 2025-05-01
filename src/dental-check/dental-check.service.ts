import { Injectable, BadRequestException } from '@nestjs/common';
import { createWriteStream } from 'fs';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from 'src/shared/services/prisma.service';
import { AIService } from 'src/shared/services/ai.service';

@Injectable()
export class DentalCheckService {
  private readonly roboflowUrl =
    'https://serverless.roboflow.com/teeth-disease-m1uob/1?api_key=xIuByx3OcFzJSR0LAA9J';

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async analyze(userId: number, file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');

    try {
      const { data } = await axios.post(
        this.roboflowUrl,
        { data: base64 },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const fileName = `${Date.now()}_${file.originalname}`;
      const filePath = path.resolve('uploads', fileName);
      await fs.writeFile(filePath, file.buffer);

      const result = await this.prisma.dentalCheck.create({
        data: {
          user_id: userId,
          result: data,
          image_url: `/uploads/${fileName}`,
        },
      });

      // ✅ Получаем пользователя
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      // ✅ Отправляем результат в ChatGPT на русском
      const explanation = await this.aiService.explainDentalCheckResultRu(
        user,
        data,
      );

      return {
        ...result,
        explanation, // Расшифровка от ИИ
      };
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message || 'Ошибка анализа зубов',
      );
    }
  }
}
