import { Module } from '@nestjs/common';
import { PlaygroundController } from '@domain/playground/playground.controller';

@Module({
  controllers: [PlaygroundController],
})
export class PlaygroundModule {}
