import { PrismaService } from 'src/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { CreateAppDto, UpdateAppDto } from '../dto/app.dto';
import { PrismaClient } from 'generated/prisma';
import { App } from 'generated/prisma';

@Injectable()
export class AppRepository extends BaseRepository {
  constructor(readonly prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Create a new app for a client can use the auth system.
   * @param data - Data to create the app (name, description).
   * @param clientId - ID of the client (Received from the AppService).
   * @param jwtSecret - JWT secret for the app (Generated automatically).
   * @param prismaClient - Optional Prisma client instance (For transactions management).
   * @returns A promise that resolves to the created app.
   */
  async createApp(
    data: CreateAppDto,
    clientId: string,
    jwtSecret: string,
    prismaClient?: PrismaClient,
  ): Promise<App> {
    const { name, description } = data;

    const newApp = await this.transaction(prismaClient).app.create({
      data: {
        clientId,
        name,
        jwtSecret,
        description,
      },
    });

    return newApp;
  }

  /**
   * Update an existing app's details.
   * @param appId - ID of the app to be updated.
   * @param data - Data to update the app (name, description).
   * @param clientId - ID of the client (To ensure the app belongs to the client).
   * @param prismaClient - Optional Prisma client instance (For transactions management).
   * @returns A promise that resolves the updated app.
   */
  async updateApp(
    appId: string,
    clientId: string,
    data: UpdateAppDto,
    prismaClient?: PrismaClient,
  ): Promise<App> {
    return this.transaction(prismaClient).app.update({
      where: { id: appId, clientId },
      data,
    });
  }

  /**
   * Delete an existing app.
   * @param appId - ID of the app to be deleted.
   * @param clientId - ID of the client (To ensure the app belongs to the client).
   * @param prismaClient - Optional Prisma client instance (For transactions management).
   * @returns A promise that resolves the deleted app.
   */
  async deleteApp(
    appId: string,
    clientId: string,
    prismaClient?: PrismaClient,
  ): Promise<App> {
    return this.transaction(prismaClient).app.delete({
      where: { id: appId, clientId },
    });
  }

  /**
   * Get an existing app by its ID.
   * @param appId - ID of the app to be retrieved.
   * @param clientId - ID of the client (To ensure the app belongs to the client).
   * @returns A promise that resolves to the found app or null if not found.
   */
  async getAppById(
    appId: string,
    clientId: string,
    prismaClient?: PrismaClient,
  ): Promise<App | null> {
    return this.transaction(prismaClient).app.findFirst({
      where: { id: appId, clientId },
    });
  }

  /**
   * Get all apps for a specific client.
   * @param clientId - ID of the client (To ensure the apps belong to the client).
   * @returns A promise that resolves to an array of apps.
   */
  async getAllAppsByClientId(
    clientId: string,
    prismaClient?: PrismaClient,
  ): Promise<App[]> {
    return this.transaction(prismaClient).app.findMany({
      where: { clientId },
    });
  }
}
