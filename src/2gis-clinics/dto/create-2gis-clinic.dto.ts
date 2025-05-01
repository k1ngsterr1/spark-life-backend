import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClinicSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  city?: string = 'Москва';

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  pageSize?: number = 20;
}
