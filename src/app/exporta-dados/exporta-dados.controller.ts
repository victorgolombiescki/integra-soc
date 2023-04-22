import { ExportaDadosDto } from './dto/exporta-dados.dto';
import { ExportaDadosService } from './exporta-dados.service';
import { Body, Controller, Post, ValidationPipe, Get } from '@nestjs/common';
import { ExtrairDadosEsocialService } from './extrair-dados-portal-esocial.service';

@Controller('exporta-dados')
export class ExportaDadosController {
  constructor(
    private readonly exportaDadosService: ExportaDadosService,
    private readonly extrairDadosEsocialService: ExtrairDadosEsocialService,
  ) {}

  @Post('/extrair-dados')
  async extrairDados(@Body(ValidationPipe) exportaDadosDto: ExportaDadosDto) {
    return await this.exportaDadosService.processar(exportaDadosDto);
  }
}
