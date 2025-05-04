import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class UploadDto {
  @Type(() => Number)
  @IsInt()
  patient_id: number;
  @Type(() => Number)
  @IsInt()
  doctor_id: number;

  @IsOptional()
  file: string;
}
