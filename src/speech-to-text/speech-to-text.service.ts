import { Injectable, HttpException } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs/promises';
import OpenAI from 'openai';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SpeechToTextService {
  private client: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    try {
      const uploadsDir = join(__dirname, '..', 'uploads');

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
        language: 'ru',
      });

      await fs.unlink(tempFilePath);

      return transcription.text;
    } catch (error) {
      console.error('SpeechToTextService error:', error);
      throw new HttpException('Failed to transcribe audio', 500);
    }
  }

  async analyzeAnxietyLevel(userId: number, answers: string[]): Promise<any> {
    try {
      const prompt = `
Ты опытный психотерапевт. Проанализируй ответы пользователя на вопросы о самочувствии. Оцени несколько параметров отдельно, по шкале от 0 до 100:
- anxiety_level
- stress_level
- emotional_stability
- energy_level
И сделай общий вывод (summary).

Ответ строго в JSON формате без комментариев.

Ответы пользователя:
1. ${answers[0]}
2. ${answers[1]}
3. ${answers[2]}
    `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: 'Ты профессиональный психолог-аналитик.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      let content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty AI response');
      }

      // 🔥 Удаляем обертки ```json или ``` просто
      content = content.replace(/```json|```/g, '').trim();

      console.log('🧠 Cleaned OpenAI answer:', content);

      const result = JSON.parse(content);

      await this.prisma.anxietyCheck.create({
        data: {
          user_id: userId,
          answers,
          anxiety_level: result.anxiety_level,
          stress_level: result.stress_level,
          emotional_stability: result.emotional_stability,
          energy_level: result.energy_level,
          summary: result.summary,
        },
      });

      return result;
    } catch (error) {
      console.error('analyzeAnxietyLevel error:', error);
      throw new HttpException('Failed to analyze anxiety level', 500);
    }
  }
}
