import { PrismaService } from 'src/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { RegisterAppDto } from '../dto/app.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class AppRepository extends BaseRepository {
  constructor(readonly prisma: PrismaService) {
    super(prisma);
  }

  async createApp(data: RegisterAppDto, prismaClient?: PrismaClient) {
    const { clientId, name, jwtSecret, jwtExpiresIn } = data;

    if (!clientId || !name || !jwtSecret || !jwtExpiresIn) {
      throw new Error('Missing required fields');
    }

    return this.transaction(prismaClient).app.create({
      data: {
        clientId,
        name,
        jwtSecret,
        jwtExpiresIn,
      },
    });
  }
}
