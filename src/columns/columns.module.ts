import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './entities/column.entity';
import { AuthModule } from '@/auth/auth.module';
import { Project } from '@/projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column, Project]), AuthModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
