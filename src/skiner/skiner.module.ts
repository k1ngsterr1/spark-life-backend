import { Module } from '@nestjs/common';
import { SkiniverController } from './skiner.controller';
import { SkiniverService } from './skiner.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [SkiniverController],
  providers: [SkiniverService, PrismaService],
})
export class SkinerModule {}
