import { IsString, IsNotEmpty, Length } from 'class-validator';

/**
 * Data Transfer Object for creating a new app
 */
export class CreateAppDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(0, 200)
  description?: string;
}

export class CreateAppQueryDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;
}

export class UpdateAppParamsDto {
  @IsString()
  @IsNotEmpty()
  appId: string;
}

export class UpdateAppDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;
}
