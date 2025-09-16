import {
  BadRequestException,
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { GoogleAuthConfig } from 'src/config/googleAuth.config';
import { google } from 'googleapis';
import crypto from 'crypto';
import { Request } from 'express';
import { URL } from 'url';
import type oauth2Client from 'googleapis';
import { AuthService } from '../../auth.service';
import { PlanType, Provider } from '../../dto/client.dto';
import { JwtService } from '@nestjs/jwt';

interface StatePayload {
  csrfToken: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class GoogleService {
  private clientID: string;
  private clientSecret: string;
  private redirectUri: string;
  private oauth2Client: oauth2Client.Common.googleAuthLibrary.OAuth2Client;
  private provider = 'google';

  constructor(
    private readonly googleAuthConfig: GoogleAuthConfig,
    private readonly authService: AuthService,
    @Inject('STATE_JWT') private readonly stateJwt: JwtService,
  ) {
    this.clientID = this.googleAuthConfig.getGoogleEnvConfig().clientID;
    this.clientSecret = this.googleAuthConfig.getGoogleEnvConfig().clientSecret;
    this.redirectUri = this.googleAuthConfig.getGoogleEnvConfig().redirectUri;

    this.oauth2Client = new google.auth.OAuth2(
      this.clientID,
      this.clientSecret,
      this.redirectUri,
    );
  }

  // Public Functions

  /**
   * Get the Google OAuth2 authorization URL and store the state in the session
   * @returns The authorization URL
   */
  public getAuthUrl() {
    // Generate a unique state parameter
    const state = this.setState();

    // Store the state in a JWT
    const token = this.stateToJWT(state);

    // Generate the Google OAuth2 authorization URL
    const authorizationUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      redirect_uri: this.redirectUri,
      scope: this.setScopes(),
      state: token,
      prompt: 'consent',
    });

    return authorizationUrl;
  }

  public async googleCallbackLogic(code: string, req: Request) {
    try {
      //Validate Session
      this.verifyStateWithJWT(req);

      // Desestructuring user info
      const { id, email, name } = await this.getUserInfo(req);

      // Getting server response
      const response = await this.authService.registerWithOAuthAndLocal({
        providerAccountId: id,
        email,
        name,
        provider: this.provider as Provider,
        password: null,
        plan: PlanType.FREE,
      });

      // Returning response
      return response;

      // Error Handling
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      } else if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Google OAuth failed: ${error.message}`,
        );
      } else {
        throw new InternalServerErrorException(
          `Google OAuth failed: ${JSON.stringify(error)}`,
        );
      }
    }
  }

  // GetAuthUrl Private Functions

  /**
   * Set the required OAuth2 scopes
   * @returns The OAuth2 scopes
   */
  private setScopes() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return scopes;
  }

  /**
   * Set the OAuth2 state to reduce the risk of CSRF attacks
   * @returns The OAuth2 state
   */
  private setState() {
    const state = crypto.randomBytes(32).toString('hex');

    return state;
  }

  /**
   * Convert the OAuth2 state to a JWT
   * @param state The OAuth2 state
   * @returns The JWT
   */
  private stateToJWT(state: string) {
    return this.stateJwt.sign({ state });
  }

  // Private function for google callback

  /**
   * Verify the OAuth2 state JWT
   * @param token The JWT
   * @returns The decoded state payload
   */
  private verifyStateWithJWT(req: Request): StatePayload {
    try {
      const token = req.query.state as string;

      if (!token) {
        throw new UnauthorizedException('Possible CSRF attack detected');
      }

      return this.stateJwt.verify<StatePayload>(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired state');
    }
  }

  /**
   * Get the access token from the authorization code
   * @param req The request object
   * @returns The access token
   */
  private async getAccessToken(req: Request) {
    const code = this.getCodeOfResultGoogleCallbackUrl(req);
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens.access_token;
  }

  /**
   * Get the result URL for the Google callback
   * @param req The request object
   * @returns The result URL
   */
  private getResultUrl(req: Request) {
    const resultUrl = new URL(req.protocol + '://' + req.get('host') + req.url);

    return resultUrl;
  }

  /**
   * Get the code parameter from the Google callback URL
   * @param req The request object
   * @returns The code parameter
   */
  private getCodeOfResultGoogleCallbackUrl(req: Request) {
    const resultUrl = this.getResultUrl(req);

    return resultUrl.searchParams.get('code') ?? '';
  }

  /**
   * Get user information from Google Apis
   * @param req The request object
   * @returns The user information
   */
  private async getUserInfo(req: Request) {
    try {
      const accessToken = await this.getAccessToken(req);

      // Set credentials on the OAuth2 client
      this.oauth2Client.setCredentials({ access_token: accessToken });

      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      if (!data.email || !data.id) {
        throw new BadRequestException('Incomplete user data from Google');
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name || data.email.split('@')[0],
      };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      } else if (err instanceof Error) {
        throw new InternalServerErrorException(
          `Failed to get Google user info: ${err.message}`,
        );
      } else {
        throw new InternalServerErrorException(
          `Failed to get Google user info: ${JSON.stringify(err)}`,
        );
      }
    }
  }
}
