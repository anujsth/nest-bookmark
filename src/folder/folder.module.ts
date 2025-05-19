import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  controllers: [FolderController],
  providers: [FolderService, AuthGuard],
})
export class FolderModule {}
