import { IsString, IsInt } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  name: string;

  @IsInt()
  owner_id: number;

  @IsString()
  address: string;

  @IsString()
  city: string;
}
