import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProjectMember]),
    PassportModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    JwtModule.register({
      secret: 'super-secret-key',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
