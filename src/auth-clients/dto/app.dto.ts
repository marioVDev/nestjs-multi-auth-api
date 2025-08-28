import { IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new app
 */
export class CreateAppDto {
  @IsString()
  clientId: string;

  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsString()
  plan?: string;

  @IsString()
  jwtSecret: string;

  @IsString()
  jwtExpiresIn: string;
}
