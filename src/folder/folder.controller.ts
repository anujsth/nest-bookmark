import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FolderService } from './folder.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorator';
import { CreateFolderDto } from './dto';

@Controller('folder')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createFolder(
    @GetUser('id') userId: number,
    @Body() body: CreateFolderDto,
  ) {
    return this.folderService.createFolder(userId, body);
  }

  @Get('getAll')
  async getAllFolder(@GetUser('id') userId: number) {
    return this.folderService.getAllFolders(userId);
  }

  async deleteFolder() {}

  async updateFolder() {}

  async moveBookmark() {}
}
