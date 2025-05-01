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
    const {
      query,
      city,
      page,
      pageSize,
      category,
      minRating,
      minPrice,
      maxPrice,
      sortByPrice,
      sortByRating,
    } = dto;

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

      let enriched = await Promise.all(
        items.map(async (item: any) => {
          const photos = await this.getPhotosById(item.external_id);
          const averagePrice =
            Math.floor(Math.random() * (30000 - 3500 + 1)) + 3500;

          return {
            id: item.external_id,
            name: item.name,
            short_name: item.org?.name,
            address: item.address_name,
            phones:
              item.contact_groups
                ?.flatMap(
                  (group: any) =>
                    group.contacts?.filter((c: any) => c.type === 'phone') ||
                    [],
                )
                .map((c: any) => c.value) || [],

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

      // 📊 Фильтрация по рейтингу и цене
      enriched = enriched.filter((clinic) => {
        if (minRating && clinic.rating !== null && clinic.rating < minRating)
          return false;
        if (minPrice && clinic.averagePrice < minPrice) return false;
        if (maxPrice && clinic.averagePrice > maxPrice) return false;
        return true;
      });

      // 🧮 Сортировка
      if (sortByPrice) {
        enriched.sort((a, b) =>
          sortByPrice === 'asc'
            ? a.averagePrice - b.averagePrice
            : b.averagePrice - a.averagePrice,
        );
      }

      if (sortByRating) {
        enriched.sort((a, b) => {
          const aRating = a.rating ?? 0;
          const bRating = b.rating ?? 0;
          return sortByRating === 'asc' ? aRating - bRating : bRating - aRating;
        });
      }

      return enriched;
    } catch (error) {
      console.error('2GIS API error:', error.response?.data || error.message);
      throw new Error('Ошибка при запросе в 2GIS');
    }
  }
}
