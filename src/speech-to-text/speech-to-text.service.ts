import { Injectable, HttpException } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join, dirname } from 'path';
import * as fs from 'fs/promises';
import OpenAI from 'openai';

@Injectable()
export class SpeechToTextService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    try {
      const uploadsDir = join(__dirname, '..', 'uploads');

      // Проверка: если папки нет — создать её
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      const tempFilePath = join(
        uploadsDir,
        `${Date.now()}-${file.originalname}`,
      );

      await fs.writeFile(tempFilePath, file.buffer);

      const transcription = await this.client.audio.transcriptions.create({
        file: createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'ru', // или 'en' — в зависимости от задачи
      });

      await fs.unlink(tempFilePath); // Удаляем файл после обработки

      return transcription.text;
    } catch (error) {
      console.error('SpeechToTextService error:', error);
      throw new HttpException('Failed to transcribe audio', 500);
    }
  }
}
