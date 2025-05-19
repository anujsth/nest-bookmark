import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { AuthGuard } from 'src/auth/auth.guard';
import { RedisModule } from 'src/redis-module/redis-module.module';

@Module({
  controllers: [BookmarkController],
  providers: [BookmarkService, AuthGuard],
  imports: [RedisModule],
})
export class BookmarkModule {}
