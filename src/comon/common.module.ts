import { Module } from '@nestjs/common';
import { IdFactory } from './factories/id.fatory';
import { TokenFactory } from './factories/secret.factory';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { StateForCsrf } from './utils/state-for-csrf';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN_CSRF') || '5m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IdFactory, TokenFactory, StateForCsrf],
  exports: [IdFactory, TokenFactory, StateForCsrf],
})
export class CommonModule {}
