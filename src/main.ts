import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';

/**
 * Environment Variables
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Libraries
 */
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const PORT = process.env.PORT ?? 3000;

  /**
   * Middlewares
   */
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Setting up global prefix and API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Setting 'v1' as the default version for all controllers
  });

  await app.listen(PORT);
  console.info(`Server running on: http://localhost:${PORT}/api/v1`);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
});
