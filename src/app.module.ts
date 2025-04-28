import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { ClinicModule } from './clinic/clinic.module';
import { DoctorModule } from './doctor/doctor.module';
import { ServicesModule } from './service/service.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SkinerModule } from './skiner/skiner.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
    SkinerModule,
    SharedModule,
    AuthModule,
    NotificationModule,
    ClinicModule,
    ServicesModule,
    DoctorModule,
  ],
})
export class AppModule {}
