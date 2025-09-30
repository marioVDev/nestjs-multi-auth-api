import { GithubService } from './github.service';
import type { Response, Request } from 'express';

import {
  Controller,
  Res,
  Get,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';

@Controller('api/auth/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  /**
   * Initiates the GitHub OAuth flow.
   * @param res - The response object to redirect the user.
   * @returns - A redirection to the GitHub OAuth authorization URL.
   */
  @Get('')
  public githubOAuth(@Res() res: Response) {
    const authUrl = this.githubService.getAuthUrl();

    res.redirect(authUrl);
  }

  /**
   * Handles the GitHub OAuth callback.
   * @param res - The response object to send the result.
   * @param req - The request object containing the callback data.
   * @returns - A redirection to the home page or an error message.
   */
  @Get('callback')
  public async githubOAuthCallback(@Res() res: Response, @Req() req: Request) {
    try {
      const serverResponse = await this.githubService.githubCallback(req);

      res.cookie('authToken', serverResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      res.redirect('http://localhost:3000/');
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        res.status(error.getStatus()).send(error.message);
      } else {
        res.status(500).send('Unknown error during Google authentication');
      }
    }
  }
}
