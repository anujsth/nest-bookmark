import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
    controllers:[BookmarkController],
    providers: [BookmarkService,AuthGuard],
  imports:[]
})
export class BookmarkModule {}
