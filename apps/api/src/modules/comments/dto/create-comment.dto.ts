import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great idea! We are considering this for Q2.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ example: true, description: 'Mark as official team response' })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;
}
