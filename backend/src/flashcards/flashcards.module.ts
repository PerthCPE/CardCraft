import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';

@Module({
  imports: [UsersModule],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
