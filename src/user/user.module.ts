import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SharedModule } from 'src/shared/shared.module';
import { PrismaService } from 'src/shared/services/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [SharedModule],
  providers: [UserService, PrismaService, JwtService],
  controllers: [UserController],
})
export class UserModule {}
