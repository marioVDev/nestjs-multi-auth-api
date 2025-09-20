import { Injectable, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface StatePayload {
  csrfToken: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class StateForCsrf {
  constructor(private readonly stateJwt: JwtService) {}
  /**
   * Set the OAuth2 state to reduce the risk of CSRF attacks
   * @returns The OAuth2 state
   */
  public setState() {
    const state = crypto.randomBytes(32).toString('hex');

    return state;
  }

  /**
   * Convert the OAuth2 state to a JWT
   * @param state The OAuth2 state
   * @returns The JWT
   */
  public stateToJWT(state: string) {
    return this.stateJwt.sign({ state });
  }

  // Private function for google callback

  /**
   * Verify the OAuth2 state JWT
   * @param token The JWT
   * @returns The decoded state payload
   */
  public verifyStateWithJWT(req: Request): StatePayload {
    try {
      const token = req.query.state as string;

      if (!token) {
        throw new UnauthorizedException('Possible CSRF attack detected');
      }

      return this.stateJwt.verify<StatePayload>(token);
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Handle errors thrown during state verification
   * @param err The error to handle
   */
  private handleError(err: unknown): never {
    if (err instanceof Error && err.message === 'jwt expired') {
      throw new UnauthorizedException('State has expired');
    } else if (err instanceof Error && err.message === 'invalid token') {
      throw new UnauthorizedException('Invalid state token');
    } else if (err instanceof Error && err.message === 'CSRF attack detected') {
      throw new UnauthorizedException('Invalid or expired state');
    } else {
      throw new UnauthorizedException('Possible CSRF attack detected');
    }
  }
}
