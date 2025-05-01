import { Injectable } from '@nestjs/common';
import { CreateClinicSearchDto } from './dto/create-2gis-clinic.dto';
import axios from 'axios';

@Injectable()
export class TwoGisClinicService {
  private readonly API_KEY = '0384218b-dd5e-4b27-bb93-d139c9d3b110';
  private readonly BASE_URL = 'https://catalog.api.2gis.com/3.0/items';
  private readonly ALMATY_REGION_ID = '141265769829260';

  async getPhotosById(externalId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/byid`, {
        params: {
          id: externalId,
          key: this.API_KEY,
          fields: 'items.photos',
        },
      });

      return (
        response.data.result?.items?.[0]?.photos?.map((p: any) => p.image) || []
      );
    } catch (error) {
      console.error('2GIS photo fetch error:', error.message);
      return [];
    }
  }

  async searchClinics(dto: CreateClinicSearchDto) {
    const { query, city, page, pageSize, category } = dto;

    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          q: query,
          key: this.API_KEY,
          page,
          page_size: pageSize,
          fields:
            'items.point,items.address_name,items.name,items.schedule,items.contact_groups,items.rubrics,items.link,items.reviews,items.org,items.external_id,items.description,items.features',
          region: city || this.ALMATY_REGION_ID,
        },
      });

      let items = response.data.result.items;

      if (category) {
        items = items.filter((item: any) =>
          item.rubrics?.some((r: any) =>
            r.name.toLowerCase().includes(category.toLowerCase()),
          ),
        );
      }

      const enriched = await Promise.all(
        items.map(async (item: any) => {
          const photos = await this.getPhotosById(item.external_id);
          const averagePrice =
            Math.floor(Math.random() * (30000 - 3500 + 1)) + 3500;

          return {
            id: item.external_id,
            name: item.name,
            short_name: item.org?.name,
            address: item.address_name,
            phone:
              item.contact_groups?.[0]?.contacts?.find(
                (c: any) => c.type === 'phone',
              )?.value || 'Не указан',
            schedule: item.schedule?.working_hours?.text || 'Нет данных',
            location: item.point,
            link: item.link || '',
            rating: item.reviews?.rating || null,
            reviews_count: item.reviews?.count || 0,
            categories: item.rubrics?.map((r: any) => r.name),
            images: photos,
            averagePrice,
          };
        }),
      );

      return enriched;
    } catch (error) {
      console.error('2GIS API error:', error.response?.data || error.message);
      throw new Error('Ошибка при запросе в 2GIS');
    }
  }
}
