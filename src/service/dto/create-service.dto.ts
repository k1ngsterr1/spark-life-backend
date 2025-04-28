import { IsString, IsInt } from 'class-validator';

// test

export class CreateServiceDto {
  @IsString()
  clinic_id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  price: number;
}
