import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenFactory {
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
