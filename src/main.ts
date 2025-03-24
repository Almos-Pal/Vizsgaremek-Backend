import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { join } from 'path';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('RepVault')
    .setDescription(`
      RepVault API
  
      A védett végpontok eléréséhez Bearer típusú JWT tokent kell használnia.
      Az authentikáció fül alatt lévő /login végponton keresztül tud tokenhez jutni. Adja meg a felhasználónevét és jelszavát,
      illetve ha még nincs felhasználója, regisztráljon az /register végponton keresztül és aztán jelentkezzen be. 
      Ezt követően kattintson az "Authorize" gombra a Swagger felületén, majd másolja be a tokenjét.
  
      Miután megadta a tokent, a Swagger automatikusan hozzáadja azt az "Authorization" fejléchez, 
      így Ön tesztelheti a védett végpontokat.
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )

    .addServer('http://localhost:8000', 'Development Server')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: false,
    validateCustomDecorators: true,
    exceptionFactory: (errors) => {
      return new BadRequestException(
        errors.map(error => `${error.property} mező hibás: ${Object.values(error.constraints).join(', ')}`)
      );
    }
  }));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');


  await app.listen(8000);
}
bootstrap();

