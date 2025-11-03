import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../client.repository';
import bcrypt from 'bcrypt';
import { LoginClientDto } from 'src/auth-clients/dto/client.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

/**
 * Transaction repository for managing login transactions
 */
@Injectable()
export class LoginRepository {
  constructor(private clientRepository: ClientRepository) {}

  /**
   * Logs in a client using their email and password.
   * @param clientData The login credentials of the client.
   * @returns The authenticated client.
   */
  public async loginWithPasswordAndEmail(clientData: LoginClientDto) {
    const { email, password } = clientData;

    const client = await this.clientRepository.getClientByEmail(email);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.password) {
      throw new UnauthorizedException('Password not set');
    }

    const isPasswordValid = await this.verifyPassword(
      password,
      client.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return client;
  }

  /**
   * Verifies a password against a hashed password.
   * @param password The plain text password to verify.
   * @param hashedPassword The hashed password to compare against.
   * @returns True if the password is valid, false otherwise.
   */
  private async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
