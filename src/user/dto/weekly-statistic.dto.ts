import { Type } from 'class-transformer';
import { IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeeklyStatisticDto {
  @ApiProperty({
    description: 'Количество выпитой воды в литрах за день',
    example: 2.5,
    type: Number,
  })
  @Type(() => Number)
  @IsDecimal()
  water: number;

  @ApiProperty({
    description: 'Количество часов сна за сегодня',
    example: 9,
    type: Number,
  })
  @Type(() => Number)
  @IsDecimal()
  sleep: number;
}
