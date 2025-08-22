import { PrismaClient } from 'generated/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}
