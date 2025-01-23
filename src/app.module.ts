import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdzesModule } from './edzes/edzes.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { GyakorlatModule } from './gyakorlat/gyakorlat.module';

@Module({
  imports: [ EdzesModule,UsersModule,ConfigModule.forRoot(), AuthModule, GyakorlatModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
