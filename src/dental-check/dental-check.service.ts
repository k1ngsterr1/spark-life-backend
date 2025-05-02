import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { PrismaService } from 'src/shared/services/prisma.service';
import { AIService } from 'src/shared/services/ai.service';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class DentalCheckService {
  private readonly roboflowUrl =
    'https://serverless.roboflow.com/teeth-disease-m1uob/1';
  private readonly roboflowApiKey = 'xIuByx3OcFzJSR0LAA9J';

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async analyze(userId: number, base64Url: string) {
    const matches = base64Url.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestException('Invalid base64 image data');
    }

    const mimeType = matches[1];
    const base64Data = matches[2].replace(/\r?\n|\r/g, '');
    const extension = mimeType.split('/')[1];

    try {
      const fileName = `${Date.now()}.${extension}`;
      const filePath = path.resolve('uploads', fileName);
      const buffer = Buffer.from(base64Data, 'base64');
      await writeFile(filePath, buffer);

      const gradcamPath = await this.generateGradcam(filePath);
      const gradcamUrl = gradcamPath
        ? `https://spark-life-backend-production-d81a.up.railway.app//uploads/${path.basename(gradcamPath)}`
        : null;

      const publicUrl = `https://spark-life-backend-production-d81a.up.railway.app//uploads/${fileName}`;

      const { data } = await axios.post(this.roboflowUrl, null, {
        params: {
          api_key: this.roboflowApiKey,
          image: publicUrl,
        },
      });

      const result = await this.prisma.dentalCheck.create({
        data: {
          user_id: userId,
          result: data,
          image_url: `/uploads/${fileName}`,
        },
      });

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const explanation = await this.aiService.explainDentalCheckResultRu(
        user,
        data,
      );

      return {
        ...result,
        explanation,
        gradcam: gradcamUrl,
      };
    } catch (error) {
      console.error('Roboflow error:', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Ошибка анализа зубов',
      );
    }
  }

  private async generateGradcam(imagePath: string): Promise<string | null> {
    const scriptPath = path.join(
      __dirname,
      '..',
      '..',
      'scripts',
      'fakeGradcam.js',
    );

    try {
      const { stdout } = await execFileAsync('node', [scriptPath, imagePath]);
      const gradcamPath = stdout.trim();

      if (!fs.existsSync(gradcamPath)) {
        throw new Error('Grad-CAM image not found');
      }

      return gradcamPath;
    } catch (error) {
      console.error('[Dental GradCAM Error]', error.message);
      return null;
    }
  }
}
