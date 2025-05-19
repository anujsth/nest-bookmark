import { Module } from '@nestjs/common';
import { ImportExportBookmarkService } from './import-export-bookmark.service';
import { ImportExportBookmarkController } from './import-export-bookmark.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  providers: [ImportExportBookmarkService],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [ImportExportBookmarkController],
})
export class ImportExportBookmarkModule {}
