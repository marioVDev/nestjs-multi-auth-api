import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../client.respository';

/**
 * Transaction repository for managing login transactions
 */
@Injectable()
export class TransactionLoginRepository {
  constructor(private clientRepository: ClientRepository) {}
}
