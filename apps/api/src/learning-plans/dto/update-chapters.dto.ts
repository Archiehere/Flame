import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ChapterInputDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsNumber()
  @IsPositive()
  timeEstimateDays!: number;
}

export class UpdateChaptersDto {
  @ValidateNested({ each: true })
  @Type(() => ChapterInputDto)
  @ArrayMinSize(1)
  chapters!: ChapterInputDto[];
}
