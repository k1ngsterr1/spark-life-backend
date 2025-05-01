import { Injectable } from '@nestjs/common';
import { CreateClinicSearchDto } from './dto/create-2gis-clinic.dto';
import axios from 'axios';

@Injectable()
export class TwoGisClinicService {
  private readonly API_KEY = 'a99da918-8d20-48f9-ad44-464d98a93ae2';
  private readonly BASE_URL = 'https://catalog.api.2gis.com/3.0/items';
  private readonly ALMATY_REGION_ID = '141265769829260';

  private clinicPriceMap = new Map<string, number>();

  private getOrGeneratePrice(id: string): number {
    if (this.clinicPriceMap.has(id)) {
      return this.clinicPriceMap.get(id)!;
    }
    const price = Math.floor(Math.random() * (30000 - 3500 + 1)) + 3500;
    this.clinicPriceMap.set(id, price);
    return price;
  }

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

    console.log('[2GIS] Incoming DTO:', JSON.stringify(dto, null, 2));

    try {
      console.log('[2GIS] Sending API request with params:', {
        q: query,
        page,
        page_size: pageSize,
        region: this.ALMATY_REGION_ID,
      });

      const response = await axios.get(this.BASE_URL, {
        params: {
          q: query,
          key: this.API_KEY,
          page,
          page_size: pageSize,
          fields:
            'items.point,items.address_name,items.name,items.schedule,items.contact_groups,items.rubrics,items.link,items.reviews,items.org,items.external_id,items.description,items.features',
          region: this.ALMATY_REGION_ID,
        },
      });

      let items = response.data.result.items;
      console.log(`[2GIS] Received ${items.length} raw items`);

      if (category) {
        items = items.filter((item: any) =>
          item.rubrics?.some((r: any) =>
            r.name.toLowerCase().includes(category.toLowerCase()),
          ),
        );
        console.log(
          `[2GIS] Filtered by category "${category}": ${items.length} items left`,
        );
      }

      let enriched = await Promise.all(
        items.map(async (item: any) => {
          const photos = await this.getPhotosById(item.external_id);
          const averagePrice = this.getOrGeneratePrice(item.external_id);

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

      console.log(`[2GIS] Enriched ${enriched.length} clinics`);

      enriched = enriched.filter((clinic) => {
        const pass =
          (!minRating ||
            clinic.rating === null ||
            clinic.rating >= minRating) &&
          (!minPrice || clinic.averagePrice >= minPrice) &&
          (!maxPrice || clinic.averagePrice <= maxPrice);

        if (!pass) {
          console.log(`[2GIS] Clinic "${clinic.name}" excluded by filters`);
        }

        return pass;
      });

      console.log(`[2GIS] Clinics after filters: ${enriched.length}`);

      if (sortByPrice) {
        enriched.sort((a, b) =>
          sortByPrice === 'asc'
            ? a.averagePrice - b.averagePrice
            : b.averagePrice - a.averagePrice,
        );
        console.log(`[2GIS] Clinics sorted by price: ${sortByPrice}`);
      }

      if (sortByRating) {
        enriched.sort((a, b) => {
          const aRating = a.rating ?? 0;
          const bRating = b.rating ?? 0;
          return sortByRating === 'asc' ? aRating - bRating : bRating - aRating;
        });
        console.log(`[2GIS] Clinics sorted by rating: ${sortByRating}`);
      }

      return enriched;
    } catch (error) {
      console.error('[2GIS] API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error('Ошибка при запросе в 2GIS');
    }
  }
}
