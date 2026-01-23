import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UsersModule, ClassroomsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
