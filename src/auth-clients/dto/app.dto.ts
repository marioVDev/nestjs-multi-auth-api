import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for creating a new app
 */
export class CreateAppDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;
}

export class UpdateAppDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;
}
