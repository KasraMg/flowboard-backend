import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import express from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { ResetPasswordDto } from './dto/reset.password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: express.Request) {
    return this.authService.findMe((req.user as User).id);
  }

  @Post('forgot-password/:email')
  async forgotPassword(@Param('email') email: string) {
    return this.authService.forgotPassword(email);
  }
  @Post('verify-otp/:email/:otp')
  async verifyOtp(@Param('email') email: string, @Param('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  @Post('reset-password/:email')
  async resetPassword(
    @Param('email') email: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(email, dto.password);
  }
}
