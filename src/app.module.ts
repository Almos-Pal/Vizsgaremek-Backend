import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoutineModule } from './edzes/routine.module';
import { EdzesModule } from './edzes/edzes.module';

@Module({
  imports: [RoutineModule, EdzesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
