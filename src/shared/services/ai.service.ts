import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';
import { User } from '@prisma/client';
import { AskAiAssistanceDto } from 'src/user/dto/ask-ai-assistance.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AIService {
  private client: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getHealthAdvice(user: User): Promise<{
    daily_sleep: string;
    daily_water: string;
    recommendation: string;
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `
You are a professional doctor therapist with 30+ years of experience.
Analyze user's diseases, body parameters, and gender to create personal advice.
Answer strictly in JSON format like this:

{
  "daily_sleep": "8 hours",
  "daily_water": "2 liters",
  "recommendation": "You should increase your sleep duration to boost your immune system."
}
          `,
          },
          {
            role: 'user',
            content: `
Diseases: ${user.diseases?.join(', ') || 'None'}
Gender: ${user.gender}
Height: ${user.height} cm
Weight: ${user.weight} kg
Age: ${user.age}
          `,
          },
        ],
        temperature: 0.3,
      });

      const text = response.choices[0]?.message?.content;

      if (!text) {
        throw new Error('Empty AI response');
      }

      const advice = JSON.parse(text);

      return advice;
    } catch (error) {
      console.error('AIService getHealthAdvice error:', error);
      throw new HttpException('Failed to get health advice', 500);
    }
  }

  async askAiAssistance(
    user: User,
    data: AskAiAssistanceDto,
  ): Promise<{
    id: string;
    text: string;
    sender: 'ai';
    timestamp: Date;
  }> {
    try {
      const userInfo = `
User information:
- Diseases: ${user.diseases?.join(', ') || 'None'}
- Gender: ${user.gender}
- Height: ${user.height} cm
- Weight: ${user.weight} kg
- Age: ${user.age}
    `.trim();

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `
You are an experienced AI assistant therapist with 30+ years of practice.
You provide advice based on the user's personal medical background and body parameters.
Always consider the diseases, age, gender, height, and weight of the user before answering.
Be empathetic, professional, clear, and focused on practical advice.
        `.trim(),
          },
          {
            role: 'user',
            content: `
${userInfo}

User question:
"${data.query}"
        `.trim(),
          },
        ],
        temperature: 0.5,
      });

      const aiText = response.choices[0]?.message?.content || 'No response';

      return {
        id: uuidv4(), // генерируем уникальный id
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('AIService askAiAssistance error:', error);
      throw new HttpException('Failed to get AI assistance', 500);
    }
  }
}
