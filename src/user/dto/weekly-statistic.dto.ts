import { Type } from 'class-transformer';
import { IsDecimal, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WeeklyStatisticDto {
  @ApiPropertyOptional({
    description: 'Количество выпитой воды в литрах за день',
    example: 2.5,
    type: Number,
  })
  @Type(() => Number)
  @IsDecimal()
  @IsOptional()
  water: number;

  @ApiPropertyOptional({
    description: 'Количество часов сна за сегодня',
    example: 9,
    type: Number,
  })
  @Type(() => Number)
  @IsDecimal()
  @IsOptional()
  sleep: number;
}
