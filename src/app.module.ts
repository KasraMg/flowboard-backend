/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { InvitationsModule } from './invitations/invitations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ColumnsModule } from './columns/columns.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { validate } from './config/env.validation';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { ImageKitModule } from './imagekit/imagekit.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        url: configService.get<string>('DATABASE_URL'),

        ssl: true,

        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 70,
      },
    ]),
    MailModule,

    UsersModule,

    TasksModule,

    AuthModule,

    ProjectsModule,

    ProjectMembersModule,

    InvitationsModule,

    DashboardModule,

    ColumnsModule,

    FavoritesModule,

    NotificationsModule,

    HealthModule,

    ImageKitModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
