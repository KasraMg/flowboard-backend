import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggle(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.favoritesService.toggle(+projectId, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@CurrentUser() user: User) {
    return this.favoritesService.findAll(user);
  }
}
