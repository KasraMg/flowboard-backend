import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post(':projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Param('projectId') projectId: number,
    @Body() createColumnDto: CreateColumnDto,
    @Req() req: Express.Request,
  ) {
    return this.columnsService.create(
      createColumnDto,
      req.user as User,
      projectId,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: number,
    @Body() updateColumnDto: UpdateColumnDto,
    @Req() req: Express.Request,
  ) {
    return this.columnsService.update(id, updateColumnDto, req.user as User);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Req() req: Express.Request) {
    return this.columnsService.remove(+id, req.user as User);
  }
}
