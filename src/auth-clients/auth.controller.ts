import {
  Controller,
  Post,
  // Res,
  // Get,
  // Req,
  // UnauthorizedException,
  // BadRequestException,
  // InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleService } from './services/google.service';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('login')
  async login() {
    // Implement login logic here
  }

  @Post('register')
  async register() {
    // Implement registration logic here
  }

  @Post('github')
  githubOAuth() {
    // Implement GitHub OAuth logic here
  }
}
