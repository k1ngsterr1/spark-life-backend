import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';
import { User } from '@prisma/client';
import { AskAiAssistanceDto } from 'src/user/dto/ask-ai-assistance.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as textToSpeech from '@google-cloud/text-to-speech';

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

  async processMedicalDocumentFromUrl(userId: number, imageUrl: string) {
    console.log('🚀 Обработка документа с image_url:', imageUrl);

    const prompt = `
Ты — опытный медицинский ИИ. Пользователь загрузил медицинский документ.

Извлеки из изображения:
- список заболеваний (массив строк)
- рост в см
- вес в кг
- возраст

Ответ в JSON:
{
  "diseases": ["..."],
  "height": 170,
  "weight": 70,
  "age": 40
}

Если чего-то нет — ставь null. Только JSON, без пояснений!
`.trim();

    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) throw new HttpException('Пустой ответ от AI', 500);

    let extracted;
    try {
      extracted = JSON.parse(content);
      console.log('✅ AI JSON:', extracted);
    } catch (err) {
      console.error('❌ Ошибка парсинга:', content);
      throw new HttpException('AI вернул некорректный JSON', 500);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        diseases: extracted.diseases || [],
        height: extracted.height ?? undefined,
        weight: extracted.weight ?? undefined,
        age: extracted.age ?? undefined,
      },
    });

    console.log('🎉 Пользователь обновлён:', updatedUser.id);
    return updatedUser;
  }

  async askAiAssistance(data: AskAiAssistanceDto): Promise<{
    id: string;
    text: string;
    audioPath: string; // путь до сгенерированного аудиофайла
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
Be empathetic, professional, clear, and focused on practical advice. Отвечай на русском! И отвечай кратко, не супер много слов! Не говори всегда здравствуйте, один раз сказал и хватитs.
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
      console.log('[askAiAssistance] Ответ от GPT:');
      console.log(aiText);

      // 🔊 Step 2: Call Google TTS API
      const ttsResponse = await this.synthesizeSpeech(aiText);

      const audioId = uuidv4();
      const audioPath = path.join(
        process.cwd(), // <--- корень проекта, а не dist
        'uploads',
        `${audioId}.wav`,
      );

      fs.writeFileSync(audioPath, Buffer.from(ttsResponse, 'base64'));
      console.log('[askAiAssistance] Аудиофайл сохранён:', audioPath);

      return {
        id: uuidv4(),
        text: aiText,
        audioPath: `https://spark-life-backend-production-d81a.up.railway.app/uploads/${audioId}.wav`,
        sender: 'ai',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('AIService askAiAssistance error:', error);
      throw new HttpException('Failed to get AI assistance', 500);
    }
  }

  private async synthesizeSpeech(text: string): Promise<string> {
    const client = new textToSpeech.TextToSpeechClient({
      keyFilename: path.join(process.cwd(), 'keys/tts-key.json'),
    });

    const request: textToSpeech.protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
        input: { text },
        voice: {
          languageCode: 'ru-RU',
          name: 'ru-RU-Chirp3-HD-Charon',
        },
        audioConfig: {
          audioEncoding: 'LINEAR16',
        },
      };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content returned from TTS');
    }

    return Buffer.from(response.audioContent as Buffer).toString('base64');
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
      const skinCheck = await this.prisma.skinCheck.findFirst({
        where: { user_id: user.id },
        orderBy: { check_datetime: 'desc' },
      });

      // Получаем последнюю запись AnxietyCheck
      const anxietyCheck = await this.prisma.anxietyCheck.findFirst({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
      });

      const services = await this.prisma.service.findMany();
      const services_full = await this.prisma.service.findMany({
        include: { clinic: true, doctors: true },
      });

      const userDiseases = user.diseases.join(', ') || 'None';

      const servicesJson = JSON.stringify(services, null, 2);
      const skinJson = JSON.stringify(skinCheck, null, 2);
      const anxietyJson = JSON.stringify(anxietyCheck, null, 2);

      const prompt =
        lang === 'ru'
          ? `У пользователя следующие заболевания: ${userDiseases}.
      Вот список всех доступных услуг (выбирай только из них, не выдумывай новые):
      ${servicesJson},

      Также учитывай оценку кожи и психологическую составляющую пользователя для более качественного подбора услуг:
      Кожа: ${skinJson},
      Психологические данные: ${anxietyJson}

      Выбери только те услуги, которые подходят пользователю. Верни результат в формате JSON массива, где каждый объект содержит:

      - id (уникальный идентификатор сервиса)
      - clinic_id (строка — ID клиники)
      - name (название услуги)
      - description (описание услуги)
      - price (целое число в тенге)

      Строго следуй этой структуре. Не добавляй ничего лишнего вне JSON массива.`
          : `The user has the following diseases: ${userDiseases}.
      Here is the list of all available services (only choose from this list, do not invent new ones):
      ${servicesJson},

      Also take into account the user's skin condition and psychological aspects to select services more accurately:
      Skin: ${skinJson},
      Psychological data: ${anxietyJson}

      Select only those services that are suitable for the user. Return the result as a JSON array, where each object must include:

      - id (unique service identifier)
      - clinic_id (string — clinic ID)
      - name (service name)

      Strictly follow this structure. Do not include anything outside the JSON array.`;

      const chatCompletion = await this.client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              lang === 'ru'
                ? 'Ты доктор с большим опытом и стажем. Отвечай строго в формате JSON.'
                : 'You are a medical doctor with great experience. Respond strictly in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 10000,
      });

      const aiContent = chatCompletion.choices[0]?.message?.content || '[]';

      let parsedIds: { id: number }[] = [];

      try {
        parsedIds = JSON.parse(aiContent);
      } catch (jsonError) {
        console.error('Failed to parse AI response as JSON:', aiContent);
        throw new HttpException('AI response was not a valid JSON array', 500);
      }

      const selectedIds = parsedIds.map((item) => item.id);

      // Фильтруем те сервисы, которые соответствуют выбранным ID
      const recommendedServices = services_full.filter((service) =>
        selectedIds.includes(service.id),
      );

      return recommendedServices;
    } catch (error) {
      console.error('AIService getRecommendationServices error:', error);
      throw new HttpException('Failed to get AI recommendations', 500);
    }
  }

  async explainDentalCheckResultRu(
    user: User,
    result: any,
  ): Promise<{
    diagnosis: string;
    explanation: string;
    recommendation: string;
  }> {
    try {
      const systemPrompt = `
Ты — опытный стоматолог с большим медицинским опытом.
На основе результатов анализа от Roboflow объясни, какое заболевание обнаружено, что оно означает и какие действия нужно предпринять.
Отвечай строго в формате JSON, но не упоминай Roboflow:

{
  "diagnosis": "OSMF — подслизистый фиброз полости рта",
  "explanation": "OSMF — хроническое заболевание полости рта, часто связанное с жеванием табака или другими раздражителями. Может вызывать жжение, ограничение подвижности рта и в редких случаях — перерождение в рак.",
  "recommendation": "Рекомендуется срочно обратиться к стоматологу для ранней диагностики и предотвращения осложнений."
}
    `.trim();

      const userPrompt = `
Пациент: ${user.first_name} ${user.last_name}
Пол: ${user.gender}
Возраст: ${user.age ?? 'не указан'}

Результат анализа Roboflow:
${JSON.stringify(result.predictions, null, 2)}
    `.trim();

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      });

      const message = response.choices[0]?.message?.content;
      if (!message) throw new Error('Пустой ответ от ChatGPT');

      const parsed = JSON.parse(message);
      return parsed;
    } catch (error) {
      console.error('AIService explainDentalCheckResultRu error:', error);
      throw new HttpException(
        'Не удалось получить объяснение диагноза от AI',
        500,
      );
    }
  }

  async diagnoseFromAnalysisImage(userId: number, imageUrl: string) {
    console.log(
      `[diagnoseFromAnalysisImage] Начало. userId=${userId}, imageUrl=${imageUrl}`,
    );

    const prompt = `
Ты опытный врач-диагност. Пользователь загрузил фото анализа крови (ОАК, биохимия или другой лабораторный анализ).

Проанализируй изображение:
1. Определи общее состояние пациента на основе распознанных данных.
2. Укажи, есть ли отклонения от нормы (без детализации по каждому показателю).
3. Предположи возможные диагнозы или состояния.
4. Дай краткие рекомендации: что делать, к какому врачу обратиться, какие дополнительные анализы сдать.

Верни результат в виде JSON:

{
  "status": "здоров / возможны отклонения / тревожные показатели",
  "potential_diagnoses": [
    {
      "name": "Название диагноза",
      "reason": "Обоснование",
      "recommended_action": "Что рекомендуется сделать"
    }
  ],
  "advice": "Общий совет для пользователя"
}
`.trim();

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      console.log('[diagnoseFromAnalysisImage] Ответ от GPT получен');

      const text = response.choices[0]?.message?.content;

      if (!text) {
        console.error('[diagnoseFromAnalysisImage] Пустой ответ от GPT');
        throw new HttpException('Пустой ответ от GPT', 500);
      }

      let cleanedText = text.trim();

      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText
          .replace(/^```json/, '')
          .replace(/```$/, '')
          .trim();
      }

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(
          '[diagnoseFromAnalysisImage] JSON-объект не найден в тексте',
        );
        throw new HttpException('JSON не найден в ответе', 500);
      }

      let result;
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('[diagnoseFromAnalysisImage] Ошибка парсинга JSON:', err);
        throw new HttpException('Ошибка парсинга JSON', 500);
      }

      console.log(
        '[diagnoseFromAnalysisImage] JSON успешно распарсен. Сохраняем в БД...',
      );

      const saved = await this.prisma.medicalAnalysis.create({
        data: {
          user_id: userId,
          image_url: imageUrl,
          result,
        },
      });

      console.log(
        '[diagnoseFromAnalysisImage] Данные успешно сохранены с ID:',
        saved.id,
      );

      return saved;
    } catch (err) {
      console.error(
        '[diagnoseFromAnalysisImage] Ошибка во время выполнения:',
        err,
      );
      throw new HttpException('Ошибка при анализе изображения', 500);
    }
  }

  async generateRiskProfile(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        skinChecks: { orderBy: { check_datetime: 'desc' }, take: 1 },
        anxietyChecks: { orderBy: { created_at: 'desc' }, take: 1 },
        medicalAnalyses: { orderBy: { created_at: 'desc' }, take: 1 },
      },
    });

    if (!user) throw new Error('User not found');

    const prompt = `
Ты — опытный врач. Оцени уровень общего риска на основе данных пользователя.
Верни JSON строго по шаблону:

{
  "risk_score": 0.76,
  "risk_factors": [
    { "source": "SkinCheck", "label": "Подозрение на меланому", "weight": 0.8 },
    { "source": "Anxiety", "label": "Высокий уровень тревожности", "weight": 0.6 }
  ]
}

Исходные данные:
Возраст: ${user.age}
Рост: ${user.height}
Вес: ${user.weight}
Болезни: ${user.diseases.join(', ') || 'нет'}
SkinCheck: ${user.skinChecks?.[0] ? user.skinChecks[0].risk_description : 'нет'}
Anxiety: ${user.anxietyChecks?.[0] ? user.anxietyChecks[0].summary : 'нет'}
Анализ крови: ${JSON.stringify(user.medicalAnalyses?.[0]?.result || {})}
`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Ты медицинский ассистент. Отвечай строго в JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);

    await this.prisma.riskProfile.upsert({
      where: { user_id: userId },
      update: {
        risk_score: parsed.risk_score,
        risk_factors: parsed.risk_factors,
      },
      create: {
        user_id: userId,
        risk_score: parsed.risk_score,
        risk_factors: parsed.risk_factors,
      },
    });

    console.log(`✅ Risk profile updated for user ${userId}`);
  }
}
