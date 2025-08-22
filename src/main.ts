import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Express } from 'express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware for handle cookies
  app.use(cookieParser());

  // Api Basic Security
  app.use(helmet());

  // Cors config
  app.use(
    cors({
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // Disable 'X-Powered-By' header
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.disable('x-powered-by');

  // Global Pipe Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Server initialization
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 2000);
  const url = await app.getUrl();
  console.log(`Application is running on: ${url}`);
}
void bootstrap();
