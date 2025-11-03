import { AppService } from 'src/auth-clients/services/app-service/app.service';
import { App } from 'generated/prisma';

import {
  Controller,
  Post,
  Query,
  Body,
  Param,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';

import {
  CreateAppQueryDto,
  CreateAppDto,
  UpdateAppDto,
  UpdateAppParamsDto,
} from 'src/auth-clients/dto/app.dto';

@Controller('api/apps')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  public async createApp(
    @Body() body: CreateAppDto,
    @Query() query: CreateAppQueryDto,
  ) {
    const createdApp = await this.appService.createApp(body, query.clientId);

    return this.handleServerResponse(
      'Application created successfully',
      true,
      createdApp,
    );
  }

  @Patch(':appId')
  public async updateApp(
    @Body() body: UpdateAppDto,
    @Query() query: CreateAppQueryDto,
    @Param() params: UpdateAppParamsDto,
  ) {
    const updatedApp = await this.appService.updateApp(
      params.appId,
      query.clientId,
      body,
    );

    return this.handleServerResponse(
      'Application updated successfully',
      true,
      updatedApp,
    );
  }

  @Get(':appId')
  public async getAppById(
    @Query() query: CreateAppQueryDto,
    @Param() params: UpdateAppParamsDto,
  ) {
    const app = await this.appService.getAppById(params.appId, query.clientId);

    return this.handleServerResponse(
      'Application retrieved successfully',
      true,
      app,
    );
  }

  @Get()
  public async getAllApps(@Query() query: CreateAppQueryDto) {
    const apps = await this.appService.getAppsByClientId(query.clientId);

    return this.handleServerResponse(
      'Applications retrieved successfully',
      true,
      apps,
    );
  }

  @Delete(':appId')
  public async deleteApp(
    @Query() query: CreateAppQueryDto,
    @Param() params: UpdateAppParamsDto,
  ) {
    const deletedApp = await this.appService.deleteApp(
      query.clientId,
      params.appId,
    );

    return this.handleServerResponse(
      'Application deleted successfully',
      true,
      deletedApp,
    );
  }

  private handleServerResponse(
    message: string,
    success: boolean,
    app: App | App[],
  ) {
    return {
      success,
      message,
      app,
    };
  }
}
