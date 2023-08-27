import { Module } from '@nestjs/common';
import { PlaygroundController } from '@domain/playground/playground.controller';
import { PlaygroundCore } from '@domain/playground/core/playground.core';
import { PlaygroundService } from '@domain/playground/service/playground.service';
import { PlaygroundRepository } from '@domain/playground/repository/playground.repository';

@Module({
  controllers: [PlaygroundController],
  providers: [PlaygroundService, PlaygroundCore, PlaygroundRepository],
})
export class PlaygroundModule {}
