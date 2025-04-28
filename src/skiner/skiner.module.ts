import { Module } from '@nestjs/common';
import { SkiniverController } from './skiner.controller';
import { SkiniverService } from './skiner.service';

@Module({
  controllers: [SkiniverController],
  providers: [SkiniverService],
})
export class SkinerModule {}
