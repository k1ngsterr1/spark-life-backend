import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'Patronymic of the user (optional for some countries)',
    example: 'Williamovich',
  })
  @IsString()
  patronymic: string;

  @ApiProperty({
    description: 'Diseases (list of diseases)',
    example: ['Diabetes', 'Hypertension'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  diseases: string[];

  @ApiProperty({
    description: 'Medical document (file upload)',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  med_doc: any;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  password: string;
}
