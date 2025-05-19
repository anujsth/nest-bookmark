import { Test, TestingModule } from '@nestjs/testing';
import { ImportExportBookmarkService } from './import-export-bookmark.service';

describe('ImportExportBookmarkService', () => {
  let service: ImportExportBookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportExportBookmarkService],
    }).compile();

    service = module.get<ImportExportBookmarkService>(ImportExportBookmarkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
