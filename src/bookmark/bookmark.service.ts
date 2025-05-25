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

  getBookmarksCacheKey(userId: number, search?: string) {
    if (search) {
      return `bookmarks:user:${userId}:search:${search}`;
    }
    return `bookmarks:user:${userId}`;
  }

  getBookmarkCacheKey(bookmarkId: number) {
    return `bookmark:${bookmarkId}`;
  }

  async getBookmarks(userId: number, search?: string) {
    try {
      const sanitizedSearch = search?.trim() || undefined;
      const cacheKey = this.getBookmarksCacheKey(userId, sanitizedSearch);
      const cachedBookmarks = await this.cacheManager.get(cacheKey);

      if (cachedBookmarks) {
        return cachedBookmarks;
      }

      const bookmarks = await this.prisma.bookmark.findMany({
        where: {
          userId,
          ...(search && {
            title: { contains: search, mode: 'insensitive' },
          }),
        },
      });

      console.log(bookmarks, 'bookmarks');

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

  async addBookmarkToFolder(
    userId: number,
    folderId: number,
    bookmarkId: number,
  ) {
    try {
      const bookmark = await this.prisma.bookmark.findFirst({
        where: {
          id: bookmarkId,
          userId,
        },
      });
      if (!bookmark) {
        throw new NotFoundException('Bookmark not found');
      }

      if (bookmark.folderId === folderId) {
        return {
          message: 'Bookmark already in this folder',
          bookmark,
        };
      }

      const folder = await this.prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
        },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      const response = await this.prisma.bookmark.update({
        where: {
          id: bookmarkId,
          userId,
        },
        data: {
          folderId,
        },
      });

      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Error from database');
      }
      throw error;
    }
  }
}
