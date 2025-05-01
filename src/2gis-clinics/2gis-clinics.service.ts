import { Injectable } from '@nestjs/common';
import { CreateClinicSearchDto } from './dto/create-2gis-clinic.dto';
import axios from 'axios';

@Injectable()
export class TwoGisClinicService {
  private readonly API_KEY = '0384218b-dd5e-4b27-bb93-d139c9d3b110';
  private readonly BASE_URL = 'https://catalog.api.2gis.com/3.0/items';

  async searchClinics(dto: CreateClinicSearchDto) {
    const { query, city, page, pageSize } = dto;

    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          q: query,
          key: this.API_KEY,
          page,
          page_size: pageSize,
          fields:
            'items.point,items.address_name,items.name,items.schedule,items.contact_groups,items.rubrics',
          region: city,
        },
      });

      return response.data.result.items.map((item: any) => ({
        name: item.name,
        address: item.address_name,
        phone:
          item.contact_groups?.[0]?.contacts?.find(
            (c: any) => c.type === 'phone',
          )?.value || 'Не указан',
        schedule: item.schedule?.working_hours?.text || 'Нет данных',
        location: item.point,
        categories: item.rubrics?.map((r: any) => r.name),
      }));
    } catch (error) {
      console.error('2GIS API error:', error.response?.data || error.message);
      throw new Error('Ошибка при запросе в 2GIS');
    }
  }
}
