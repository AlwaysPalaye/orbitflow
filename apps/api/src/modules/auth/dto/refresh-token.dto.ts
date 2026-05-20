import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for refresh token requests.
 * Validates that a non-empty string refresh token is provided.
 */
export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token received during login or previous refresh' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
