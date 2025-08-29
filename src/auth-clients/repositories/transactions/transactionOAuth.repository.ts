import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Provider } from '../../dto/client.dto';

import {
  ClientRepository,
  ClientAccountRepository,
} from '../client.respository';

import {
  ClientRegistrationData,
  CreateClientAccountDto,
  CreateClientDto,
} from '../../dto/client.dto';

/**
 * Transaction repository for managing database transactions
 */
@Injectable()
export class TransactionOAuthRepository {
  constructor(
    private clientRepository: ClientRepository,
    private readonly prisma: PrismaService,
    private clientAccountRepository: ClientAccountRepository,
  ) {}

  /**
   * Register a new user with an account
   * @param data - The user registration data
   * @returns The created user
   */
  public async registerUserWithAccount(data: ClientRegistrationData) {
    const { provider } = data;

    if (provider === Provider.LOCAL) {
      return this.handleLocalRegistration(data);
    } else if (provider === Provider.GOOGLE || provider === Provider.GITHUB) {
      return this.handleOAuthRegistration(data);
    } else {
      throw new Error('Unsupported provider');
    }
  }

  /**
   * Handle the logic for user registration
   * @param data - The user registration data
   * @returns The created user
   */
  private async handleLocalRegistration(data: ClientRegistrationData) {
    const { email, name, password, plan, provider, providerAccountId } = data;

    const existingUser = await this.clientRepository.getClientByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return this.createClientWithAccount({
      clientData: { email, name, password, plan },
      accountData: { provider, providerAccountId },
    });
  }

  /**
   * Handle the logic for OAuth registration
   * @param data - The user registration data
   * @returns The created user
   */
  private async handleOAuthRegistration(data: ClientRegistrationData) {
    const { email, name, plan, provider, providerAccountId } = data;

    const existingUser = await this.clientRepository.getClientByEmail(email);

    if (existingUser) {
      return this.linkAccount(existingUser.id, {
        provider,
        providerAccountId,
      });
    }

    return this.createClientWithAccount({
      clientData: { email, name, password: null, plan },
      accountData: { provider, providerAccountId },
    });
  }

  /**
   * Link an existing user account
   * @param idUser - The ID of the user
   * @param accountData - The account data to link
   * @returns The linked account or an error
   */
  private async linkAccount(
    idUser: string,
    accountData: Pick<CreateClientAccountDto, 'provider' | 'providerAccountId'>,
  ) {
    const existingAccount =
      await this.clientAccountRepository.getClientAccountByProviderAndProviderId(
        {
          provider: accountData.provider,
          providerAccountId: accountData.providerAccountId,
        },
      );

    if (existingAccount) {
      return { existingAccount, isNewAccount: false };
    }

    return this.prisma.$transaction(async (tx) => {
      await this.clientAccountRepository.createClientAccount(
        idUser,
        accountData,
        tx,
      );

      return { user: idUser, isNewAccount: true };
    });
  }

  /**
   * Create client with account in single transaction
   */
  private async createClientWithAccount(data: {
    clientData: CreateClientDto;
    accountData: CreateClientAccountDto;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const client = await this.clientRepository.createClient(
        data.clientData,
        tx,
      );

      await this.clientAccountRepository.createClientAccount(
        client.id,
        data.accountData,
        tx,
      );

      return client;
    });
  }
}
