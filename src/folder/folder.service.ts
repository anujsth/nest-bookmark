import { ConflictException, Injectable } from '@nestjs/common';
import { CreateFolderDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  async createFolder(userId: number, body: CreateFolderDto) {
    try {

      if(body.parentId){
        const parentFolder = await this.prisma.folder.findFirst({
          where: {
            parentId: body.parentId,
            userId,
          }
        })
        if(!parentFolder){
          throw new ConflictException('Parent folder not found');
        }
      }

      const response = await this.prisma.folder.create({
        data: {
          ...body,
          userId,
        },
      });
      return response;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Folder with that name already exists');
      }
      throw error;
    }
  }

  async getAllFolders(userId: number) {
    try {
      const response = await this.prisma.folder.findMany({
        where: {
          userId,
        },
        orderBy: { createdAt: 'asc' },
      });
      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ConflictException('Error from databse');
      }
      throw error;
    }
  }

  async updateFolder(){}
  
}
