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

  async askAiAssistance(data: AskAiAssistanceDto): Promise<{
    id: string;
    text: string;
    sender: 'ai';
    timestamp: Date;
  }> {
    try {
      const user = data.user;

      const userInfo = `
User information:
- First Name: ${user.firstName || user.first_name || 'Unknown'}
- Last Name: ${user.lastName || user.last_name || 'Unknown'}
- Phone: ${user.phone || 'Unknown'}
- Email: ${user.email || 'Unknown'}
    `.trim();

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `
You are an experienced AI assistant therapist with 30+ years of practice.
You provide advice based on the user's personal medical background and contact details.
Always consider user's name, age, gender, diseases and body parameters if available.
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
        id: uuidv4(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('AIService askAiAssistance error:', error);
      throw new HttpException('Failed to get AI assistance', 500);
    }
  }

  async aiStats(
    user: User,
    userLanguage: 'ru' | 'en' = 'en',
  ): Promise<{
    daily_sleep: string;
    daily_water: string;
    recommendation: string;
  }> {
    try {
      const diseasesList = user.diseases?.length
        ? user.diseases.join(', ')
        : userLanguage === 'ru'
          ? 'Нет заболеваний'
          : 'No diseases';

      const systemPrompt =
        userLanguage === 'ru'
          ? `
Ты опытный врач. На основе заболеваний пользователя, его пола, возраста, роста и веса, дай рекомендации:
- сколько часов сна нужно в день ("daily_sleep")
- сколько литров воды нужно пить в день ("daily_water")
- краткое пояснение ("recommendation")

Ответ строго в формате JSON:

{
  "daily_sleep": "7-8 часов",
  "daily_water": "2.5 литра",
  "recommendation": "Рекомендуется увеличить количество выпиваемой воды и нормализовать сон из-за наличия гипертонии и диабета."
}
        `.trim()
          : `
You are an experienced medical AI assistant. Based on the user's diseases, gender, age, height, and weight, provide health recommendations:
- How many hours of sleep are needed per day ("daily_sleep")
- How many liters of water are needed per day ("daily_water")
- A short explanation ("recommendation")

Answer strictly in JSON format:

{
  "daily_sleep": "7-8 hours",
  "daily_water": "2.5 liters",
  "recommendation": "It is recommended to increase water intake and improve sleep hygiene due to hypertension and diabetes."
}
        `.trim();

      const userPrompt = `
Diseases: ${diseasesList}
Gender: ${user.gender}
Age: ${user.age ?? (userLanguage === 'ru' ? 'Не указан' : 'Unknown')}
Height: ${user.height ?? (userLanguage === 'ru' ? 'Не указан' : 'Unknown')} cm
Weight: ${user.weight ?? (userLanguage === 'ru' ? 'Не указан' : 'Unknown')} kg
    `.trim();

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty AI response');
      }

      const stats = JSON.parse(content);

      return stats;
    } catch (error) {
      console.error('AIService aiStats error:', error);
      throw new HttpException('Failed to get AI stats', 500);
    }
  }
}
