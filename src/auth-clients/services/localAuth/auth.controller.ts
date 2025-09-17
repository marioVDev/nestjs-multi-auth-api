import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import type { Response } from 'express';
import { Res, Body } from '@nestjs/common';
import { AuthLocalService } from './auth.service';
import { Clients } from 'generated/prisma';
import {
  LoginClientDto,
  CreateClientDto,
} from 'src/auth-clients/dto/client.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authLocalService: AuthLocalService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async localLogin(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginClientDto,
  ) {
    const serverResponse = await this.authService.loginWithEmail(loginDto);

    if (!serverResponse) {
      throw new Error('Authentication service returned no response');
    }

    // Set authentication cookie
    this.setCookies(res, serverResponse.token);

    // Return response data - NestJS handles status codes
    return this.handleReturnMessage(
      serverResponse.message,
      serverResponse.client,
      serverResponse.authType,
      serverResponse.isNewUser,
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() createClientDto: CreateClientDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const serverResponse =
      await this.authLocalService.registerLocalAuth(createClientDto);

    if (!serverResponse) {
      throw new Error('Registration service returned no response');
    }

    // Set authentication cookie
    this.setCookies(res, serverResponse.token);

    // Return response data - NestJS handles status codes
    return this.handleReturnMessage(
      serverResponse.message,
      serverResponse.client,
      serverResponse.authType,
      serverResponse.isNewUser,
    );
  }

  /**
   * Sets the authentication cookies in the response.
   * @param res The response object.
   * @param token The authentication token.
   */
  private setCookies(res: Response, token: string) {
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  /**
   * Prepares the response message for the client.
   * @param message The response message.
   * @param client The client data.
   * @param authType The authentication type.
   * @param isNewUser Whether the user is new.
   * @returns The prepared response object.
   */
  private handleReturnMessage(
    message: string | string[],
    client: Omit<Clients, 'password'>,
    authType: string,
    isNewUser: boolean,
  ) {
    return {
      message,
      client,
      authType,
      isNewUser,
    };
  }
}
