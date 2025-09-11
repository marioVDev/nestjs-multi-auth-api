import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleController } from './services/google.controller';
import { GoogleAuthConfig } from 'src/config/googleAuth.config';
import { TransactionOAuthRepository } from './repositories/transactions/transactionOAuth.repository';
import { LoginRepository } from './repositories/transactions/login.respository';
import {
  ClientAccountRepository,
  ClientRepository,
} from './repositories/client.respository';
import { GoogleService } from './services/google.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, GoogleController],
  providers: [
    {
      provide: 'STATE_JWT',
      useFactory: (configService: ConfigService) => {
        return new JwtService({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '5m' }, // para el state
        });
      },
      inject: [ConfigService],
    },

    // Services
    AuthService,
    GoogleService,
    PrismaService,

    // Repositories
    ClientRepository,
    ClientAccountRepository,
    LoginRepository,
    TransactionOAuthRepository,

    // Configuration
    GoogleAuthConfig,
  ],
  exports: [AuthService, GoogleService, JwtModule, 'STATE_JWT'],
})
export class AuthModule {}
