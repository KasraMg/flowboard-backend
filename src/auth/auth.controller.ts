import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access token',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  getMe(@CurrentUser() user: User) {
    return this.authService.findMe(user.id);
  }

  @Post('forgot-password/:email')
  @ApiOperation({
    summary: 'Send password reset OTP',
  })
  forgotPassword(@Param('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-otp/:email/:otp')
  @ApiOperation({
    summary: 'Verify password reset OTP',
  })
  verifyOtp(@Param('email') email: string, @Param('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  @Post('reset-password/:email')
  @ApiOperation({
    summary: 'Reset user password',
  })
  resetPassword(@Param('email') email: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(email, dto.password);
  }
}
