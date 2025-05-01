import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
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

  async analyze(userId: number, base64Url: string) {
    // Извлекаем base64-строку и mime-тип
    const matches = base64Url.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestException('Invalid base64 image data');
    }

    const mimeType = matches[1]; // например, image/jpeg
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1]; // jpeg, png и т.д.

    try {
      // Отправляем только base64 в Roboflow
      const { data } = await axios.post(
        this.roboflowUrl,
        { data: base64Data },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      // Сохраняем изображение
      const fileName = `${Date.now()}.${extension}`;
      const filePath = path.resolve('uploads', fileName);
      const buffer = Buffer.from(base64Data, 'base64');
      await writeFile(filePath, buffer);

      // Сохраняем в БД
      const result = await this.prisma.dentalCheck.create({
        data: {
          user_id: userId,
          result: data,
          image_url: `/uploads/${fileName}`,
        },
      });

      // Получаем пользователя и объяснение
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const explanation = await this.aiService.explainDentalCheckResultRu(
        user,
        data,
      );

      return {
        ...result,
        explanation,
      };
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message || 'Ошибка анализа зубов',
      );
    }
  }
}
