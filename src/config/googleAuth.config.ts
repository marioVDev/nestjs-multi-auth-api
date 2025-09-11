import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAuthConfig {
  constructor(private configService: ConfigService) {}

  getGoogleEnvConfig() {
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientID || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth configuration');
    }

    return {
      clientID,
      clientSecret,
      redirectUri,
    };
  }
}
