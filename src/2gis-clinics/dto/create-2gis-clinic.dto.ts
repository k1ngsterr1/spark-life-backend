import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClinicSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  city?: string = 'Москва';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortByPrice?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortByRating?: 'asc' | 'desc';
}
