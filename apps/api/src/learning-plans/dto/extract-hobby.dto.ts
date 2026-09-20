import { IsString, MinLength } from 'class-validator';

export class ExtractHobbyDto {
  @IsString()
  @MinLength(1)
  message!: string;
}
