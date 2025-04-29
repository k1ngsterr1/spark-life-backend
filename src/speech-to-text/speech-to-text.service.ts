import { Injectable, HttpException } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
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
      const tempFilePath = join(
        __dirname,
        '..',
        'temp',
        `${Date.now()}-${file.originalname}`,
      );
      await fs.writeFile(tempFilePath, file.buffer);

      const transcription = await this.client.audio.transcriptions.create({
        file: createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'ru', // или 'en' — в зависимости от цели
      });

      await fs.unlink(tempFilePath); // удаляем временный файл

      return transcription.text;
    } catch (error) {
      console.error('SpeechToTextService error:', error);
      throw new HttpException('Failed to transcribe audio', 500);
    }
  }
}
