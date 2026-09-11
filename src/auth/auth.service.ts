/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { PasswordResetService } from 'src/password-reset/password-reset.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,

    private jwtService: JwtService,
    private readonly passwordResetService: PasswordResetService,
    private readonly mailService: MailService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const emailExit = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });
    if (emailExit) {
      throw new ConflictException(
        'An account is already registered with your email address',
      );
    }

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'User registered successfully',
      success: true,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
      access_token: accessToken,
    };
  }
  async login(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Password is not currect');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      success: true,
      access_token: this.jwtService.sign(payload),
      message: 'User logined successfully',
    };
  }

  async findMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalProjects = await this.projectMemberRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return {
      success: true,
      data: {
        user,
        stats: {
          totalProjects,
          totalTasks: 0,
          completedTasks: 0,
          incompleteTasks: 0,
        },
      },
    };
  }

  async resetPassword(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const reset = await this.passwordResetService.createNewOtp(email);

    await this.mailService.sendOtpWithEmail(email, reset.otp);

    return {
      success: true,
      message: 'Password reset code sent successfully',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    return await this.passwordResetService.verifyOtp(email, otp);
  }
}
