import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Dark mode support' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'It would be great to have a dark mode option for better readability at night.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({ example: 'UI/UX' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
