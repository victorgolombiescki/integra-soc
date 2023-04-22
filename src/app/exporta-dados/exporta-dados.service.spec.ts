import { Test, TestingModule } from '@nestjs/testing';
import { ExportaDadosService } from './exporta-dados.service';

describe('ExportaDadosService', () => {
  let service: ExportaDadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportaDadosService],
    }).compile();

    service = module.get<ExportaDadosService>(ExportaDadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
