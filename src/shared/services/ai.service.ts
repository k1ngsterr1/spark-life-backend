import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';
import { User } from '@prisma/client';
import { AskAiAssistanceDto } from 'src/user/dto/ask-ai-assistance.dto';

@Injectable()
export class AIService {
  private client = new OpenAI();
  constructor(private readonly prisma: PrismaService) {}
  async getHydration(user: User): Promise<any> {
    const response = await this.client.responses.create({
      model: 'gpt-4.1',
      instructions: `
        Talk as a personal doctor therapist with over 30 years of expirience.
        Use user's diseases, body parameters, gender to help you generate your final answer.
        Give asnwer only in JSON format like this:
        {
          "daily_sleep": "10 hours",
          "daily_water": "2 litres",
          "recommendation": "You need to sleep more to help improving your health, and drink less water to improve your skin"
        }
        `,
      input: `
        Diseases: ${user.diseases.join(',')},
        Gender: ${user.gender},
        Height: ${user.height},
        Weight: ${user.weight},
        Age: ${user.age}
        `,
    });

    return response.output_text;
  }

  async askAiAssistance(data: AskAiAssistanceDto): Promise<any> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              'You are a highly experienced doctor therapist assisting patients. Provide clear and professional advice.',
          },
          {
            role: 'user',
            content: data.query,
          },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new HttpException('Failed to get AI response', 500);
    }
  }
}
