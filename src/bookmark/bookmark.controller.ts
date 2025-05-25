import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from 'src/auth/decorator';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';
// No additional code needed here
@Controller('bookmark')
@UseGuards(AuthGuard)
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get('all/:search')
  async getBookmarks(
    @GetUser('id') id: number,
    @Param('search') search?: string,
  ) {
    return this.bookmarkService.getBookmarks(id, search);
  }

  @Post('create')
  async createBookmark(
    @GetUser('id') id: number,
    @Body() bookmark: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(id, bookmark);
  }

  @Get(':id')
  async getBookmarkById(@Param('id') id: number) {
    return this.bookmarkService.getBookmarkById(id);
  }

  @Delete('delete/:id')
  async deleteBookmark(
    @GetUser('id') id: number,
    @Param('id') bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmark(id, Number(bookmarkId));
  }

  @Patch('update/:id')
  async updateBookmark(
    @GetUser('id') id: number,
    @Param('id') bookmarkId: number,
    @Body() data: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmark(id, bookmarkId, data);
  }

  @Patch('addBookmarkToFolder/:id')
  async addBookmarkToFolder(
    @GetUser('id') userId: number,
    @Param('id') bookmarkId: number,
    @Body('folderId') folderId: number,
  ) {
    return this.bookmarkService.addBookmarkToFolder(
      userId,
      Number(folderId),
      Number(bookmarkId),
    );
  }
}
