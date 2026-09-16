import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { ReorderColumnsDto } from './dto/reorder-column-dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post(':projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Param('projectId') projectId: number,
    @Body() createColumnDto: CreateColumnDto,
    @CurrentUser() user: User,
  ) {
    return this.columnsService.create(createColumnDto, user, projectId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: number,
    @Body() updateColumnDto: UpdateColumnDto,
    @CurrentUser() user: User,
  ) {
    return this.columnsService.update(id, updateColumnDto, user);
  }

  @Patch('reorder/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reorder(
    @Param('projectId') projectId: number,
    @Body() reorderColumnsDto: ReorderColumnsDto,
    @CurrentUser() user: User,
  ) {
    return this.columnsService.reorder(projectId, reorderColumnsDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.columnsService.remove(+id, user);
  }
}
