import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks an endpoint as publicly accessible - no JWT required.
 * Use sparingly: only for login, register, health, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
