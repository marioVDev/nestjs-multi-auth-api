import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export enum PlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum Provider {
  GOOGLE = 'google',
  GITHUB = 'github',
  LOCAL = 'local',
}

/**
 * Data Transfer Object for creating a new client
 */
export class CreateClientDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PlanType, { message: 'Plan must be free, premium, or enterprise' })
  @IsNotEmpty()
  plan: PlanType = PlanType.FREE;
}

/**
 * Data Transfer Object for updating an existing client
 */
export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(PlanType, { message: 'Plan must be free, premium, or enterprise' })
  plan?: PlanType;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password?: string;
}

/**
 * Data Transfer Object for client accounts
 */
export class CreateClientAccountDto {
  @IsNotEmpty()
  @IsEnum(Provider, { message: 'Provider must be google, github, or local' })
  provider: Provider;

  @IsNotEmpty()
  @IsString()
  providerAccountId: string;
}
