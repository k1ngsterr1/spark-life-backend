import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
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
}
