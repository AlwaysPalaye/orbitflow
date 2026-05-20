import { ApiProperty } from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export { PostStatus };

export class UpdatePostStatusDto {
  @ApiProperty({ enum: PostStatus, example: PostStatus.PLANNED })
  @IsEnum(PostStatus)
  status: PostStatus;
}
