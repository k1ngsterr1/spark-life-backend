import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: 'John Doe', description: 'Doctor full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Cardiologist', description: 'Doctor specialty' })
  @IsString()
  specialty: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/doctor_photos/photo.jpg',
    format: 'binary',
    type: 'string',
  })
  @IsOptional()
  photo: string;

  @ApiProperty({ example: 4.5, description: 'Doctor rating (0-5)' })
  @IsNumber()
  rating: number;

  @ApiProperty({ example: 120, description: 'Number of reviews' })
  @IsNumber()
  review_count: number;

  @ApiProperty({
    example: '10 years experience in cardiology',
    description: 'Work experience description',
  })
  @IsString()
  experience: string;

  @ApiProperty({
    example: ['Harvard Medical School', 'Stanford University'],
    description: 'List of educations',
  })
  @IsArray()
  education: string[];

  @ApiProperty({
    example: ['English', 'Spanish'],
    description: 'Languages spoken by the doctor',
  })
  @IsArray()
  languages: string[];

  @ApiProperty({
    example: 'e2c39c2d-420a-44b1-8d19-5c9b2f503a3a',
    description: 'Clinic ID to which the doctor belongs',
  })
  @IsUUID()
  clinic_id: string;

  @ApiProperty({
    example: { days: ['Monday', 'Wednesday'], hours: '9:00-18:00' },
    description: 'Doctor working schedule (days and hours)',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  schedule: any;

  @ApiProperty({ example: '150$', description: 'Consultation price' })
  @IsString()
  price: string;

  @ApiProperty({
    example: ['Aetna', 'BlueCross'],
    description: 'List of accepted insurance companies',
  })
  @IsArray()
  accepts_insurance: string[];

  @ApiProperty({
    example: 'Specializes in heart and vascular diseases.',
    description: 'About the doctor',
  })
  @IsString()
  about: string;
}
