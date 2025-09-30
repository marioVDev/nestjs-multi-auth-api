import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import type { Response, Request } from 'express';
import { GoogleService } from './google.service';

@Controller('api/auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('')
  public googleOAuth(@Res() res: Response) {
    const authUrl = this.googleService.getAuthUrl();

    res.redirect(authUrl);
  }

  @Get('callback')
  public async googleOAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const serverResponse = await this.googleService.googleCallbackLogic(req);

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
