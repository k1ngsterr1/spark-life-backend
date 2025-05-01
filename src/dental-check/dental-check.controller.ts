import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DentalCheckService } from './dental-check.service';

@Controller('dental-check')
export class DentalCheckController {
  constructor(private readonly dentalCheckService: DentalCheckService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.dentalCheckService.analyze(userId, file);
  }
}
