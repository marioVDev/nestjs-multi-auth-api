import { Module } from '@nestjs/common';
import { IdFactory } from './factories/id.fatory';
import { TokenFactory } from './factories/secret.factory';

@Module({
  providers: [IdFactory, TokenFactory],
  exports: [IdFactory, TokenFactory],
})
export class CommonModule {}
