import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, description: 'ID of the doctor' })
  @IsInt()
  doctor_id: number;

  @ApiProperty({ example: 123, description: 'ID of the user (patient)' })
  @IsInt()
  user_id: number;

  @ApiProperty({
    example: '2025-05-01T10:30:00Z',
    description: 'Appointment date and time in ISO 8601 format',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: 'Consultation about skin issue',
    description: 'Optional description of the appointment',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

// commit
