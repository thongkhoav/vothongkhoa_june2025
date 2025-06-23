import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AccessTokenGuard } from './common/guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { TaskGateway } from './task.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    TaskModule,
  ],
  providers: [
    TaskGateway,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {
  constructor() {}
}
