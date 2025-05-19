import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ImportExportBookmarkModule } from './import-export-bookmark/import-export-bookmark.module';
import { FolderModule } from './folder/folder.module';
import { RedisModule } from './redis-module/redis-module.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
    UserModule,
    ImportExportBookmarkModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FolderModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
