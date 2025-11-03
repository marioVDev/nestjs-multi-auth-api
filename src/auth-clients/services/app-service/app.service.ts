import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/auth-clients/repositories/app.repository';
import { CreateAppDto, UpdateAppDto } from 'src/auth-clients/dto/app.dto';
import { TokenFactory } from 'src/comon/factories/secret.factory';
import { App } from 'generated/prisma';

import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly tokenFactory: TokenFactory,
  ) {}

  /**
   * Create a new application with a generated JWT secret.
   * @param appData - Data for the new application.
   * @return The created application.
   * @throws BadRequestException if the creation fails.
   */
  public async createApp(
    appData: CreateAppDto,
    clientId: string,
  ): Promise<App> {
    try {
      const JWTsecret = this.tokenFactory.generateToken();
      const newApp = await this.appRepository.createApp(
        appData,
        clientId,
        JWTsecret,
      );

      if (!newApp) {
        throw new BadRequestException('Failed to create application');
      }

      return newApp;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    }
  }

  /**
   * Update an existing application.
   * @param appId - ID of the application to update.
   * @param clientId - ID of the client that owns the application.
   * @param appData - Updated data for the application.
   * @returns The updated application.
   * @throws BadRequestException if the update fails.
   */
  public async updateApp(
    appId: string,
    clientId: string,
    appData: UpdateAppDto,
  ) {
    const updatedApp = await this.appRepository.updateApp(
      appId,
      clientId,
      appData,
    );

    if (!updatedApp) {
      throw new BadRequestException('Failed to update application');
    }

    return updatedApp;
  }

  /**
   * Delete an application.
   * @param clientId - ID of the client that owns the application.
   * @param appId - ID of the application to delete.
   * @returns The deleted application.
   * @throws BadRequestException if the deletion fails.
   */
  public async deleteApp(clientId: string, appId: string): Promise<App> {
    const deletedApp = await this.appRepository.deleteApp(appId, clientId);

    if (!deletedApp) {
      throw new BadRequestException('Failed to delete application');
    }

    return deletedApp;
  }

  public async getAppById(appId: string, clientId: string): Promise<App> {
    const app = await this.appRepository.getAppById(appId, clientId);

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    return app;
  }

  /**
   * Get all applications for a specific client.
   * @param clientId - ID of the client.
   * @returns An array of applications for the client.
   * @throws BadRequestException if no applications are found.
   */
  public async getAppsByClientId(clientId: string): Promise<App[] | []> {
    const apps = await this.appRepository.getAllAppsByClientId(clientId);

    return apps;
  }
}
