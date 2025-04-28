import { Type } from 'class-transformer';
import { IsDecimal } from 'class-validator';

export class WeeklyStatisticDto {
  @Type(() => Number)
  @IsDecimal()
  water: number;

  @Type(() => Number)
  @IsDecimal()
  sleep: number;
}
