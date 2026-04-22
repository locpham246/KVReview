import { Module } from '@nestjs/common';
import { KolService } from './kol.service';
import { KolController } from './kol.controller';

@Module({
  controllers: [KolController],
  providers: [KolService],
})
export class KolModule {}
