// src/user/dto/update-user.dto.ts
import { Gender } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Gender)
  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  age?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @ApiPropertyOptional()
  height?: number; // см

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @ApiPropertyOptional()
  weight?: number; // кг
}
