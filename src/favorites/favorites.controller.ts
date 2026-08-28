import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggle(@Param('projectId') projectId: string, @Req() req: Express.Request) {
    return this.favoritesService.toggle(+projectId, req.user as User);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: Express.Request) {
    return this.favoritesService.findAll(req.user as User);
  }
}
