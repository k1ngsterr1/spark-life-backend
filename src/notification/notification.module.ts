import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SharedModule } from 'src/shared/shared.module';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [SharedModule],
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationController],
})
export class NotificationModule {}
