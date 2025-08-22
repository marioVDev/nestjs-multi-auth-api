/**
 * Data Transfer Object for creating a new app
 */
export class RegisterAppDto {
  id?: string;
  clientId?: string;
  name: string;
  description: string;
  jwtSecret?: string;
  jwtExpiresIn?: string;
  allowedProviders?: string[];
  callbackUrls: string[];
}
