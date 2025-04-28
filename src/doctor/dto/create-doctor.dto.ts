import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  name: string;

  @IsString()
  specialty: string;

  @IsString()
  photo: string;

  @IsNumber()
  rating: number;

  @IsNumber()
  review_count: number;

  @IsString()
  experience: string;

  @IsArray()
  education: string[];

  @IsArray()
  languages: string[];

  @IsString()
  clinic_id: string;

  @IsObject()
  schedule: any;

  @IsString()
  price: string;

  @IsArray()
  accepts_insurance: string[];

  @IsString()
  about: string;
}
