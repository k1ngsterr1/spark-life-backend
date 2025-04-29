import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email or phone number in E.164 format',
    example: 'ruslanmakhmatov@gmail.com',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'Delta2005_5',
  })
  @IsString()
  password: string;
}
