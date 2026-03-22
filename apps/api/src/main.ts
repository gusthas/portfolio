import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

/**
 * BOOTSTRAP — Ponto de entrada da aplicação
 *
 * Aqui configuramos:
 * 1. Fastify como adapter HTTP (mais rápido que Express)
 * 2. ValidationPipe global (valida automaticamente todos os DTOs)
 * 3. Swagger (documentação automática da API)
 * 4. CORS (permite que o frontend acesse a API)
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV === 'development' }),
  );

  // -------------------------------------------------------------------------
  // VALIDAÇÃO GLOBAL
  // ValidationPipe transforma e valida automaticamente os dados de entrada.
  // Se alguém mandar um campo inválido, retorna 400 Bad Request automaticamente.
  // whitelist: remove campos que não estão no DTO (segurança)
  // transform: converte strings para os tipos corretos (ex: "42" → 42)
  // -------------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // -------------------------------------------------------------------------
  // CORS
  // Permite que o frontend (localhost:3000 em dev, domínio real em prod) acesse a API
  // -------------------------------------------------------------------------
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_SITE_URL
        : ['http://localhost:3000', 'http://localhost:6006'],
    credentials: true,
  });

  // -------------------------------------------------------------------------
  // SWAGGER — Documentação automática
  // Acessível em /docs quando NODE_ENV !== 'production'
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Portfolio API')
      .setDescription(
        'API do portfólio pessoal — Skills, Hobbies, Métricas e Webhooks',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log('Swagger disponível em http://localhost:3001/docs');
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`API rodando em http://localhost:${port}`);
}

bootstrap();
