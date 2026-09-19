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
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        // synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
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
  ],
})
export class AppModule {}
