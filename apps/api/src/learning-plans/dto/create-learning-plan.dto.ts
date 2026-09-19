import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';
import { HobbyLevel } from '../enums/index.js';

export class CreateLearningPlanDto {
  @IsString()
  @MinLength(1)
  hobby!: string;

  @IsEnum(HobbyLevel)
  level!: HobbyLevel;

  @IsDateString()
  targetDate!: string;
}
