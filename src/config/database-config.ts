import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  getConnectionConfig() {
    const host = this.configService.get<string>('DB_HOST');
    const portStr = this.configService.get<string>('DB_PORT');
    const user = this.configService.get<string>('DB_USERNAME');
    const password = this.configService.get<string>('DB_PASSWORD');
    const database = this.configService.get<string>('DB_NAME');

    if (!host || !portStr || !user || !password || !database) {
      throw new Error(
        'Missing database configuration in environment variables',
      );
    }

    const port = Number(portStr);
    if (isNaN(port)) {
      throw new Error('DB_PORT must be a valid number');
    }

    return { host, port, user, password, database };
  }
}
