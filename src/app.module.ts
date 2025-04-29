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
import { SpeechToTextModule } from './speech-to-text/speech-to-text.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
    SpeechToTextModule,
    SkinerModule,
    SharedModule,
    AuthModule,
    NotificationModule,
    ClinicModule,
    ServicesModule,
    DoctorModule,
    SpeechToTextModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
