import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { RegisterClientDto } from '../dto/client.dto';

@Injectable()
export class ClientRepository {
  constructor(private prisma: PrismaService) {}

  async createClient(data: RegisterClientDto) {
    const { id, email, name } = data;

    if (!id || !email || !name) {
      throw new Error('Email and name are required');
    }

    return await this.prisma.clients.create({ data: { id, email, name } });
  }
}
