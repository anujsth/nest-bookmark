import { Test, TestingModule } from '@nestjs/testing';
import { ImportExportBookmarkController } from './import-export-bookmark.controller';

describe('ImportExportBookmarkController', () => {
  let controller: ImportExportBookmarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportExportBookmarkController],
    }).compile();

    controller = module.get<ImportExportBookmarkController>(ImportExportBookmarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
