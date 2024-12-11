import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from "graphql-upload"
import * as express from "express"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // DTO validation globally integration
  app.useGlobalInterceptors(new LoggingInterceptor()) // Requestni log qilib beradi (Morgan kabi)
  app.enableCors({origin: true, credentials: true})
  app.use(graphqlUploadExpress({maxFileSize: 15000000, maxfiles: 10}))
  app.use("/uploads", express.static("./uploads"))
  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
