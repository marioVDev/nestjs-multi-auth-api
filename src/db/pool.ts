import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DatabaseConfigService } from 'src/config/database-config';

@Injectable()
export class DatabasePool {
  private pool: Pool;

  constructor(private DatabaseConfigService: DatabaseConfigService) {
    const { host, port, user, password, database } =
      this.DatabaseConfigService.getConnectionConfig();

    this.pool = new Pool({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
    });
  }

  getPool(): Pool {
    return this.pool;
  }
}
