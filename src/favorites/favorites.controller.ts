import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle project favorite status',
    description:
      'Adds project to favorites if it is not favorited, otherwise removes it.',
  })
  @ApiParam({
    name: 'projectId',
    type: Number,
    description: 'Project id',
  })
  toggle(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.favoritesService.toggle(+projectId, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user favorite projects',
  })
  findAll(@CurrentUser() user: User) {
    return this.favoritesService.findAll(user);
  }
}
