import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdzesModule } from './edzes/edzes.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { GyakorlatModule } from './gyakorlat/gyakorlat.module';
import { IzomcsoportModule } from './izomcsoport/izomcsoport.module';
import { UserGyakorlatModule } from './user-gyakorlat/user-gyakorlat.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ 
    EdzesModule,
    UsersModule,
    ConfigModule.forRoot(), 
    AuthModule, 
    GyakorlatModule, 
    IzomcsoportModule,
    UserGyakorlatModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'test-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
