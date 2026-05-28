import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('swipejobsOS API')
    .setDescription('AI-native workforce marketplace API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('Health')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Jobs')
    .addTag('Candidates')
    .addTag('Applications')
    .addTag('Shifts')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('API_PORT', 3001);
  const host = configService.get('API_HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log(`✅ Application is running on http://${host}:${port}`);
  logger.log(`📚 Swagger documentation available at http://${host}:${port}/api/docs`);
  logger.log(`🏥 Health check available at http://${host}:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
