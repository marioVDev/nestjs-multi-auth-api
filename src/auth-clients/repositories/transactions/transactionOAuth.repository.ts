import { PrismaService } from 'src/db/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Provider } from '../../dto/client.dto';
import { Clients, ClientAccount } from 'generated/prisma';
import { IdFactory } from 'src/comon/factories/id.fatory';

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import {
  ClientRepository,
  ClientAccountRepository,
} from '../client.respository';

import {
  ClientRegistrationData,
  CreateClientAccountDto,
  CreateClientDto,
} from '../../dto/client.dto';

export type ResultOAuthOptions =
  | {
      newClient: Clients;
    }
  | {
      newAccount: ClientAccount;
      client: Clients;
      isNewAccount: boolean;
    }
  | {
      client: Clients;
      existingAccount: ClientAccount;
      isNewAccount: boolean;
    }
  | {
      client: Clients;
      isNewUser: boolean;
    };

/**
 * Transaction repository for managing database transactions
 */
@Injectable()
export class TransactionOAuthRepository {
  constructor(
    private clientRepository: ClientRepository,
    private readonly prisma: PrismaService,
    private clientAccountRepository: ClientAccountRepository,
    private idFactory: IdFactory,
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
      throw new InternalServerErrorException('Unsupported provider');
    }
  }

  /**
   * Handle the logic for user registration
   * @param data - The user registration data
   * @returns The created user
   */
  private async handleLocalRegistration(data: ClientRegistrationData) {
    const { email, name, password, plan, provider } = data;

    const existingClient = await this.clientRepository.getClientByEmail(email);

    // // Si existe cliente y necesita actualización de password
    if (existingClient && !existingClient.password) {
      const updatedClient = await this.updatePasswordClient(
        existingClient.id,
        password,
      );

      // Retornar cliente actualizado
      return { client: updatedClient, isNewUser: false };
    }

    if (!data.providerAccountId) {
      data.providerAccountId = await this.generateProviderAccountId();
    }

    // Validar conflictos
    this.validateClientConflict(existingClient);

    return this.createClientWithAccount({
      clientData: { email, name, password, plan },
      accountData: { provider, providerAccountId: data.providerAccountId },
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
      const client = await this.getClientById(idUser);
      return { client, existingAccount, isNewAccount: false };
    }

    return this.prisma.$transaction(async (tx) => {
      const account = await this.clientAccountRepository.createClientAccount(
        idUser,
        accountData,
        tx,
      );

      const client = await this.getClientById(idUser);

      return { newAccount: account, client, isNewAccount: true };
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

      return { newClient: client };
    });
  }

  private generateProviderAccountId() {
    return this.idFactory.generateId();
  }

  /**
   * Get a client by id
   * @param id - The id of the client
   * @returns The found client or null
   */
  private async getClientById(id: string) {
    const client = await this.clientRepository.getClientById({ id });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  /**
   * Validate if client already exists with password
   * @param existingClient - The existing client
   * @throws ConflictException if user already exists with password
   */
  private validateClientConflict(existingClient: Clients | null): void {
    if (existingClient && existingClient.password) {
      throw new ConflictException('User already exists');
    }
  }

  /**
   * Update password for existing client
   * @param id - The id of the client
   * @param password - The new password
   * @returns A promise that resolves when the password is updated
   */
  private async updatePasswordClient(id: string, password: string | null) {
    if (!password) {
      throw new BadRequestException('Password is required');
    }
    return this.clientRepository.updatePasswordClient(id, password);
  }
}
