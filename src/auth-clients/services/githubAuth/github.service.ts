import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { GithubAutlConfig } from 'src/config/githubAuth.config';
import { AuthService } from 'src/auth-clients/auth.service';
import { StateForCsrf } from 'src/comon/utils/state-for-csrf';
import { Request } from 'express';
import { PlanType, Provider } from 'src/auth-clients/dto/client.dto';

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GithubUser {
  id: number;
  email: string;
  name: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

@Injectable()
export class GithubService {
  private clientID: string;
  private clientSecret: string;
  private redirectUri: string;
  private provider = Provider.GITHUB;

  constructor(
    private readonly githubConfig: GithubAutlConfig,
    private readonly authService: AuthService,
    private readonly stateJwt: StateForCsrf,
  ) {
    this.clientID = this.githubConfig.getGithubAuthConfig().clientID;
    this.clientSecret = this.githubConfig.getGithubAuthConfig().clientSecret;
    this.redirectUri = this.githubConfig.getGithubAuthConfig().redirectUri;
  }

  /**
   * Get the GitHub OAuth2 authorization URL
   * @returns string - The authorization URL
   */
  public getAuthUrl(): string {
    // Generate State For CSRF
    const state = this.stateJwt.setState();

    // Store the state in a JWT
    const token = this.stateJwt.stateToJWT(state);

    // Set the URL search params
    const params = this.setUrlSearchParams(token);

    // Generate the GitHub OAuth2 authorization URL
    const authorizationUrl = this.generateGithubAuthUrl(params);

    return authorizationUrl;
  }

  public async githubCallback(req: Request) {
    try {
      //Validate Session
      this.stateJwt.verifyStateWithJWT(req);

      // Get code from query params
      const code = req.query.code as string;

      // Exchange the authorization code for an access token
      const accessTokenResponse = await this.getAccessToken(code);

      // Get user information from GitHub
      const { id, email, name } = await this.handleFetchGithubUserInfo(
        accessTokenResponse.access_token,
      );

      // Handle user login or registration
      const response = await this.authService.registerWithOAuthAndLocal({
        providerAccountId: id.toString(),
        email,
        name,
        provider: this.provider,
        password: null,
        plan: PlanType.FREE,
      });

      return response;
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      } else if (err instanceof Error) {
        throw new BadRequestException(`GitHub callback error: ${err.message}`);
      } else {
        throw new InternalServerErrorException(
          `GitHub callback error: ${JSON.stringify(err)}`,
        );
      }
    }
  }

  // Private Functions

  /**
   * Set the URL search params for the GitHub OAuth2 authorization URL
   * @param token - The state token
   * @returns URLSearchParams - The URL search params
   */
  private setUrlSearchParams(token: string): URLSearchParams {
    const params = new URLSearchParams({
      client_id: this.clientID,
      redirect_uri: this.redirectUri,
      scope: 'read:user user:email',
      state: token,
      allow_signup: 'true',
      prompt: 'consent',
    });

    return params;
  }

  /**
   * Generate the GitHub OAuth2 authorization URL
   * @param params - The URL search params
   * @returns string - The authorization URL
   */
  private generateGithubAuthUrl(params: URLSearchParams): string {
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange the authorization code for an access token
   * @returns The access token response
   */
  private async getAccessToken(code: string): Promise<AccessTokenResponse> {
    try {
      const data: Response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: new URLSearchParams({
            client_id: this.clientID,
            client_secret: this.clientSecret,
            code: code,
            redirect_uri: this.redirectUri,
          }),
        },
      );

      const response = (await data.json()) as AccessTokenResponse;

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to fetch access token: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to fetch access token: ${JSON.stringify(error)}`,
        );
      }
    }
  }

  /**
   * Get user information from GitHub (name, email?, id)
   * @param accessToken - The access token
   * @returns The user information
   */
  private async getUserInfo(accessToken: string) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      const user = (await response.json()) as GithubUser;

      if (!user.email && !user.id) {
        throw new BadRequestException('Incomplete user data from GitHub');
      }

      return {
        id: user.id,
        name: user.name || user.email.split('@')[0],
      };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      } else if (err instanceof Error) {
        throw new BadRequestException(
          `Failed to get GitHub user info: ${err.message}`,
        );
      } else {
        throw new BadRequestException(
          `Failed to get GitHub user info: ${JSON.stringify(err)}`,
        );
      }
    }
  }

  /**
   * Get the user's email addresses from GitHub
   * @param accessToken - The access token
   * @returns The user's email addresses
   */
  private async getPrimaryUserEmail(accessToken: string) {
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      const emails = (await response.json()) as GithubEmail[];

      const primaryEmail = emails.find(
        (email) => email.primary && email.verified,
      );

      if (!primaryEmail) {
        throw new BadRequestException('No primary email found for GitHub user');
      }

      return { primaryEmail };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      } else if (err instanceof Error) {
        throw new BadRequestException(
          `Failed to get GitHub user emails: ${err.message}`,
        );
      } else {
        throw new BadRequestException(
          `Failed to get GitHub user emails: ${JSON.stringify(err)}`,
        );
      }
    }
  }

  /**
   * Handle fetching user information from GitHub
   * @param accessToken - The access token
   * @returns The user information along with their email addresses
   */
  private async handleFetchGithubUserInfo(accessToken: string) {
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const userInfo = await this.getUserInfo(accessToken);

    const { primaryEmail } = await this.getPrimaryUserEmail(accessToken);

    const ghResponse = { ...userInfo, email: primaryEmail.email };

    return ghResponse;
  }
}
