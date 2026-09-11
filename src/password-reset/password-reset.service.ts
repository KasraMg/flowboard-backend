/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './entities/password-reset.entity';
import { randomInt } from 'crypto';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
  ) {}

  async createNewOtp(email: string) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otp = randomInt(1000, 10000).toString();

    const objs = await this.passwordResetRepository.find({
      where: {
        email,
        used: false,
      },
    });

    for (const obj of objs) {
      obj.used = true;
    }

    await this.passwordResetRepository.save(objs);

    const savedOtp = this.passwordResetRepository.create({
      otp,
      email,
      used: false,
      expiresAt,
    });

    return await this.passwordResetRepository.save(savedOtp);
  }
  async verifyOtp(email: string, otp: string) {
    const obj = await this.passwordResetRepository.findOne({
      where: {
        email,
        used: false,
      },
    });

    if (!obj) {
      throw new NotFoundException('Request not found');
    }

    if (obj.expiresAt < new Date()) {
      throw new ConflictException('Otp has expired');
    }

    if (obj.otp !== otp) {
      throw new ConflictException('Otp is not correct');
    }

    obj.used = true;
    await this.passwordResetRepository.save(obj);

    return {
      success: true,
    };
  }
}
