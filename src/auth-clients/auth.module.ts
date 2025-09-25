import { Module } from '@nestjs/common';
import { AuthController } from './services/localAuth/auth.controller';
import { GoogleController } from './services/googleAuth/google.controller';
import { GoogleAuthConfig } from 'src/config/googleAuth.config';
import { TransactionOAuthRepository } from './repositories/transactions/transactionOAuth.repository';
import { LoginRepository } from './repositories/transactions/login.respository';
import {
  ClientAccountRepository,
  ClientRepository,
} from './repositories/client.respository';
import { GoogleService } from './services/googleAuth/google.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/db/prisma.service';
import { CommonModule } from 'src/comon/common.module';
import { AuthLocalService } from './services/localAuth/auth.service';
import { GithubAutlConfig } from 'src/config/githubAuth.config';
import { GithubController } from './services/githubAuth/github.controller';
import { GithubService } from './services/githubAuth/github.service';

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
    CommonModule,
  ],
  controllers: [AuthController, GoogleController, GithubController],
  providers: [
    // Services
    AuthService,
    GoogleService,
    PrismaService,
    GithubService,

    // Repositories
    ClientRepository,
    ClientAccountRepository,
    LoginRepository,
    TransactionOAuthRepository,
    AuthLocalService,

    // Configuration
    GoogleAuthConfig,
    GithubAutlConfig,
  ],
  exports: [AuthService, GoogleService, JwtModule],
})
export class AuthModule {}
