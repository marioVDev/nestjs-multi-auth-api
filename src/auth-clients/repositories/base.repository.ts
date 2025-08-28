import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/db/prisma.service';

/**
 * Base repository class for managing database operations
 * @param prisma - The Prisma service instance
 *
 * Available to manage database transactions
 */
export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Get the Prisma client instance for database transactions
   * @param prismaClient - Optional Prisma client instance (manage transactions 'tx')
   * @returns The Prisma client instance
   */
  protected transaction(prismaClient?: Prisma.TransactionClient) {
    return prismaClient ?? this.prisma;
  }
}
