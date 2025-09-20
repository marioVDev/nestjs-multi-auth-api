import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubAutlConfig {
  constructor(private readonly configService: ConfigService) {}

  getGithubAuthConfig() {
    const clientID = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI');
    const authorizeUrl = this.configService.get<string>('GITHUB_AUTHORIZE_URL');

    if (!clientID || !clientSecret || !redirectUri || !authorizeUrl) {
      throw new Error('Missing Github OAuth configuration');
    }

    return {
      clientID,
      clientSecret,
      redirectUri,
      authorizeUrl,
    };
  }
}
