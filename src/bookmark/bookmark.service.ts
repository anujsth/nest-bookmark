import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BookmarkService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getBookmarksCacheKey(userId: number) {
    return `bookmarks:user:${userId}`;
  }

  getBookmarkCacheKey(bookmarkId: number) {
    return `bookmark:${bookmarkId}`;
  }

  async getBookmarks(userId: number) {
    try {
      const cacheKey = this.getBookmarksCacheKey(userId);
      const cachedBookmarks = await this.cacheManager.get(cacheKey);
      if (cachedBookmarks) {
        return cachedBookmarks;
      }
      const bookmarks = this.prisma.bookmark.findMany({
        where: {
          userId,
        },
      });
      await this.cacheManager.set(cacheKey, bookmarks);
      return bookmarks;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw new Error('Failed to fetch bookmarks');
    }
  }

  async getBookmarkById(bookmarkId: number) {
    const cacheKey = this.getBookmarkCacheKey(bookmarkId);
    const cachedBookmark = await this.cacheManager.get(cacheKey);
    if (cachedBookmark) {
      console.log('hello');
      return cachedBookmark;
    }

    const bookmark = this.prisma.bookmark.findFirst({
      where: {
        id: Number(bookmarkId),
        // userId,
      },
    });

    await this.cacheManager.set(cacheKey, bookmark);

    return bookmark;
  }

  async createBookmark(userId: number, bookmark: CreateBookmarkDto) {
    await this.cacheManager.del(this.getBookmarksCacheKey(userId));
    return this.prisma.bookmark.create({
      data: {
        title: bookmark.title,
        link: bookmark.link,
        description: bookmark.description,
        userId: userId,
      },
    });
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    try {
      const response = await this.prisma.bookmark.delete({
        where: {
          userId,
          id: bookmarkId,
        },
      });

      await Promise.all([
        this.cacheManager.del(this.getBookmarkCacheKey(bookmarkId)),
        this.cacheManager.del(this.getBookmarksCacheKey(userId)),
      ]);

      console.log(response, 'helolo');
      return response;
    } catch (error) {
      console.log(error, 'hello');
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Bookmark Not Found');
      }
      throw error;
    }
  }

  async updateBookmark(
    userId: number,
    bookmarkId: number,
    data: UpdateBookmarkDto,
  ) {
    try {
      const response = await this.prisma.bookmark.update({
        where: {
          userId,
          id: Number(bookmarkId),
        },
        data,
      });

      await Promise.all([
        this.cacheManager.del(this.getBookmarksCacheKey(userId)),
        this.cacheManager.del(this.getBookmarkCacheKey(bookmarkId)),
        this.cacheManager.set(this.getBookmarkCacheKey(bookmarkId), response),
      ]);

      return response;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Bookmark Not Found');
      }
      throw error;
    }
  }
}
