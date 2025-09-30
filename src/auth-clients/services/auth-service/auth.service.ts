import { TransactionOAuthRepository } from '../../repositories/transactions/transactionOAuth.repository';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Clients } from 'generated/prisma';
import { ClientRegistrationData, LoginClientDto } from '../../dto/client.dto';
import { LoginRepository } from '../../repositories/transactions/login.respository';
import { Provider } from '../../dto/client.dto';
import { ResultOAuthOptions } from '../../repositories/transactions/transactionOAuth.repository';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginRepository: LoginRepository,
    private readonly transactionOAuthRepository: TransactionOAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Logs in a client using email and password.
   * @param credentials The login credentials.
   * @returns The login response.
   */
  public async loginWithEmail(credentials: LoginClientDto) {
    try {
      const client =
        await this.loginRepository.loginWithPasswordAndEmail(credentials);

      const serverResponse = await this.formatNewLocalLoginResponse(client);

      return serverResponse;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      } else if (err instanceof Error) {
        console.error('Unexpected login error:', err);
        throw new InternalServerErrorException(
          'Authentication service temporarily unavailable',
        );
      }
    }
  }

  public async registerWithOAuthAndLocal(
    registrationData: ClientRegistrationData,
  ) {
    try {
      const { provider, password } = registrationData;

      if (provider === Provider.LOCAL && password) {
        this.validatePasswordStrength(password);

        registrationData.password = await this.hashPassword(password);
      }

      const result =
        await this.transactionOAuthRepository.registerUserWithAccount(
          registrationData,
        );

      return this.handleOAuthResponse(result);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      } else {
        console.error('Unexpected registration error:', err);
        throw new InternalServerErrorException(
          'Authentication service temporarily unavailable',
        );
      }
    }
  }

  /**
   * Hashes a password using bcrypt.
   * @param password The plain text password to hash.
   * @returns The hashed password.
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = 10;
      return await bcrypt.hash(password, salt);
    } catch (err) {
      throw new InternalServerErrorException('Password hashing failed');
    }
  }

  /**
   * Sanitizes the client response by omitting sensitive information.
   * @param user The user object to sanitize.
   * @returns The sanitized user object.
   */
  private sanitizeClientResponse(user: Clients): Omit<Clients, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Generates a JWT token for the client.
   * @param email The email of the client.
   * @param idClient The ID of the client.
   * @returns The generated JWT token.
   */
  private async generateToken(
    email: string,
    idClient: string,
  ): Promise<string> {
    try {
      return await this.jwtService.signAsync({ email, idClient });
    } catch (err) {
      throw new InternalServerErrorException('Token generation failed');
    }
  }

  /**
   * Validates the strength of a password.
   * @param password The password to validate.
   * @returns void
   */
  private validatePasswordStrength(password: string): void {
    if (password.includes('password') || password.includes('123456')) {
      throw new BadRequestException('Weak password');
    }
  }

  private async formatNewLocalLoginResponse(client: Clients) {
    const token = await this.generateToken(client.email, client.id);

    return {
      client: this.sanitizeClientResponse(client),
      token,
      authType: client.password ? 'local' : 'oauth',
      message: 'Login successful',
      isNewUser: false,
    };
  }

  private handleOAuthResponse(result: ResultOAuthOptions) {
    if ('existingAccount' in result) {
      return this.formatOAuthResponse(
        result.client,
        'OAuth',
        'Login Successfully',
        false,
      );
    } else if (
      'isNewAccount' in result &&
      'client' in result &&
      'newAccount' in result
    ) {
      return this.formatOAuthResponse(
        result.client,
        'OAuth',
        ['Login Successfully', 'Account linked successfully'],
        true,
      );
    } else if ('newClient' in result) {
      return this.formatOAuthResponse(
        result.newClient,
        'OAuth',
        'Registration Successful',
        true,
      );
    } else {
      throw new InternalServerErrorException('Unexpected OAuth result format');
    }
  }

  private async formatOAuthResponse(
    client: Clients,
    authType: string,
    message: string | string[],
    isNewUser: boolean,
  ) {
    const token = await this.generateToken(client.email, client.id);

    return {
      client: this.sanitizeClientResponse(client),
      token,
      authType: authType,
      message: message,
      isNewUser: isNewUser,
    };
  }
}
