import { IsArray, IsInt } from 'class-validator';

export class ReorderColumnsDto {
  @IsArray()
  @IsInt({ each: true })
  columnIds!: number[];
}
