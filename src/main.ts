import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('lncp_test')
  app.useGlobalPipes(new ValidationPipe({whitelist:true}));
  app.enableCors({
    origin:['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200'],
    credentials:true,
  });
  app.use(cookieParser());
  await app.listen(8000);
}
bootstrap();
