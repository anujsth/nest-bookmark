import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    try {
      const bookmarks = this.prisma.bookmark.findMany({
        where: {
          userId,
        },
      });
      return bookmarks;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw new Error('Failed to fetch bookmarks');
    }
  }

  async getBookmarkById(bookmarkId: number) {
    const bookmark = this.prisma.bookmark.findFirst({
      where: {
        id: Number(bookmarkId),
        // userId,
      },
    });
    return bookmark;
  }

  async createBookmark(userId:number, bookmark: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: {
        title: bookmark.title,
        link: bookmark.link,
        description: bookmark.description,
        userId: userId,
      },
    });
  }

  async deleteBookmark(userId:number, bookmarkId:number){
  try{
      const response = await this.prisma.bookmark.delete({
      where:{
        userId,
        id:bookmarkId
      }
    })
    console.log(response,"helolo")
    return response
  }catch(error){
    console.log(error,"hello")
    if(error instanceof PrismaClientKnownRequestError && error.code ==='P2025'){
      throw new NotFoundException("Bookmark Not Found")
    }
    throw error
  }
  }

  async updateBookmark(userId:number, bookmarkId:number, data:UpdateBookmarkDto){
    try {
      const response = await this.prisma.bookmark.update({
        where: {
          userId,
          id:Number(bookmarkId)
        },
        data
      })
      return response
    } catch (error) {
          if(error instanceof PrismaClientKnownRequestError && error.code ==='P2025'){
      throw new NotFoundException("Bookmark Not Found")
    }
    throw error
    }
  }

}
