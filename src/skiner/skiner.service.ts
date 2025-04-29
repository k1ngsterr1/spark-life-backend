import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SkiniverService {
  private readonly apiUrl = 'https://api.skiniver.com/predict?lang=ru';
  private readonly authHeader =
    'Basic ZmVlZGJhY2tAeWFya29sYXNlci5ydTp3N0UweFVIb1l6bmc=';

  constructor(private readonly prisma: PrismaService) {} // ⬅️ внедряем Prisma

  async predict(file: Express.Multer.File): Promise<any> {
    try {
      if (!file || !file.buffer) {
        throw new Error('Файл отсутствует или пустой');
      }

      const formData = new FormData();
      formData.append('img', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: this.authHeader,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        'Error during API request:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async saveSkinCheck(userId: number, skiniveResult: any) {
    return this.prisma.skinCheck.create({
      data: {
        user_id: userId,
        check_id: skiniveResult.check_id,
        check_datetime: new Date(skiniveResult.check_datetime),
        class: skiniveResult.class,
        class_raw: skiniveResult.class_raw,
        desease: skiniveResult.desease,
        description: skiniveResult.description,
        risk: skiniveResult.risk,
        risk_level: skiniveResult.risk_level,
        risk_description: skiniveResult.risk_description,
        risk_title: skiniveResult.risk_title,
        short_recommendation: skiniveResult.short_recommendation,
        image_url: skiniveResult.image_url,
        masked_s3_url: skiniveResult.masked_s3_url,
        colored_s3_url: skiniveResult.colored_s3_url,
        prob: skiniveResult.prob,
        uid: skiniveResult.uid,
        atlas_page_link: skiniveResult.atlas_page_link,
      },
    });
  }
}
