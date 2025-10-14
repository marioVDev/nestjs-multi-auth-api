import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { CreateClientAccountDto, CreateClientDto } from '../dto/client.dto';
import { BaseRepository } from './base.repository';
import { Prisma } from 'generated/prisma';

/**
 * Client repository for managing client data
 * @extends BaseRepository
 * @param prisma - The Prisma service instance
 */
@Injectable()
export class ClientRepository extends BaseRepository {
  constructor(readonly prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Create a new client
   * @param data - The client data
   * @returns The created client
   */
  async createClient(
    data: CreateClientDto,
    prismaClient?: Prisma.TransactionClient,
  ) {
    const { email, name, password, plan } = data;

    const client = await this.transaction(prismaClient).clients.create({
      data: { email, name, password, plan },
    });

    return client;
  }

  /**
   * Get a client by email
   * @param email - The email of the client
   * @returns The found client or null
   */
  async getClientByEmail(email: CreateClientDto['email']) {
    const client = await this.prisma.clients.findUnique({
      where: { email },
    });

    return client;
  }

  /**
   * Get a client by id
   * @param data - The client id
   * @returns The found client or null
   */
  public async getClientById(data: Pick<Prisma.ClientsWhereUniqueInput, 'id'>) {
    const client = await this.prisma.clients.findUnique({
      where: { id: data.id },
    });

    return client;
  }

  /**
   * Update the password of a client
   * @param id - The id of the client
   * @param password - The new password
   * @returns The updated client
   */
  public async updatePasswordClient(id: string, password: string) {
    const updatedClient = await this.prisma.clients.update({
      where: { id },
      data: { password },
    });

    return updatedClient;
  }
}

/**
 * Client account repository for managing client account data
 */
@Injectable()
export class ClientAccountRepository extends BaseRepository {
  constructor(readonly prisma: PrismaService) {
    super(prisma);
  }

  public async createClientAccount(
    clientId: string,
    data: CreateClientAccountDto,
    prismaClient?: Prisma.TransactionClient,
  ) {
    const { provider, providerAccountId } = data;

    if (!providerAccountId) {
      throw new ConflictException('providerAccountId is required');
    }

    const clientAccount = await this.transaction(
      prismaClient,
    ).clientAccount.create({
      data: { clientId, provider, providerAccountId },
    });

    return clientAccount;
  }

  /**
   * Get a client account by provider and provider account ID
   * @param data - The client account data
   * @returns The found client account or null
   */
  public async getClientAccountByProviderAndProviderId(
    data: CreateClientAccountDto,
  ) {
    const { provider, providerAccountId } = data;

    if (!providerAccountId) {
      throw new ConflictException('providerAccountId is required');
    }

    const clientAccount = await this.prisma.clientAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });

    return clientAccount;
  }
}
