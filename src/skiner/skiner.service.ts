import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class SkiniverService {
  private readonly apiUrl = 'https://api.skiniver.com/predict?lang=ru';
  private readonly authHeader =
    'Basic ZmVlZGJhY2tAeWFya29sYXNlci5ydTp3N0UweFVIb1l6bmc=';

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
}
