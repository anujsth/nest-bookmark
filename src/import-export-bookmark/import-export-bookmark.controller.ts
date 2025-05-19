import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImportExportBookmarkService } from './import-export-bookmark.service';
import { GetUser } from 'src/auth/decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('')
@UseGuards(AuthGuard)
export class ImportExportBookmarkController {
  constructor(private ImportExportService: ImportExportBookmarkService) {}

  @Get('export')
  async exportBookmark(@GetUser('id') id: number, @Res() res: Response) {
    const exportData = await this.ImportExportService.exportBookmarkData(id);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=bookmarks.html');
    res.send(exportData);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importBookmarks(
    @GetUser('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const response = await this.ImportExportService.importBookmark(id, file);
    return response;
  }
}
