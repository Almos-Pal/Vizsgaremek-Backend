import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdzesModule } from './edzes/edzes.module';

@Module({
  imports: [ EdzesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
