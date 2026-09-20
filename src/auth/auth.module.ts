import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ProjectMember } from '../project-members/entities/project-member.entity';
import { MailModule } from '../mail/mail.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';
import { AuthorizationService } from '../common/authorization.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProjectMember]),
    PassportModule,
    MailModule,
    PasswordResetModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, AuthorizationService],

  exports: [AuthorizationService],
})
export class AuthModule {}
