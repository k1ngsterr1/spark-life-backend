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
        temperature: 0.2,
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
  "daily_sleep": "7-8",
  "daily_water": "2.5",
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
  "daily_sleep": "7-8",
  "daily_water": "2.5",
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
  async getRecommendationServices(userId: number, lang: 'ru' | 'en') {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const services = await this.prisma.service.findMany({
        select: {
          clinic_id: true,
          name: true,
          description: true,
          price: true,
        },
      });
      console.log(user.diseases);

      const userDiseases = user.diseases.join(', ') || 'None';

      const servicesJson = JSON.stringify(services, null, 2); // ограничим длину, если нужно

      const prompt =
        lang === 'ru'
          ? `У пользователя следующие заболевания: ${userDiseases}.
Вот список всех доступных услуг (выбирай только из них, не выдумывай новые):
${servicesJson}

Выбери из них только те, которые подходят пользователю. Верни результат в формате JSON массива, где каждый объект содержит:
- clinic_id (строка),
- name (название услуги),
- description (описание),
- price (целое число в тенге).

Не добавляй ничего вне JSON.`
          : `The user has the following diseases: ${userDiseases}.
Here is the list of all available services (only choose from this list, do not invent new ones):
${servicesJson}

Select only those that are suitable for the user. Return the result as a JSON array where each object contains:
- clinic_id (string),
- name (service name),
- description,
- price (integer in KZT).

Do not include anything outside the JSON array.`;

      const chatCompletion = await this.client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              lang === 'ru'
                ? 'Ты медицинский ассистент. Отвечай строго в формате JSON.'
                : 'You are a medical assistant. Respond strictly in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      });

      const aiContent = chatCompletion.choices[0]?.message?.content || '[]';

      let parsed: any[] = [];

      try {
        parsed = JSON.parse(aiContent);
      } catch (jsonError) {
        console.error('Failed to parse AI response as JSON:', aiContent);
        throw new HttpException('AI response was not a valid JSON array', 500);
      }

      return parsed;
    } catch (error) {
      console.error('AIService getRecommendationServices error:', error);
      throw new HttpException('Failed to get AI recommendations', 500);
    }
  }
}
