import { Module } from '@nestjs/common';
import { ExportaDadosService } from './exporta-dados.service';
import { ExportaDadosController } from './exporta-dados.controller';
import { PuppeteerModule } from 'nest-puppeteer';
import { ExtrairDadosEsocialService } from './extrair-dados-portal-esocial.service';
import { ExtrairDadosSocService } from './extrair-dados-soc.service';
import { MontarDtoMapper } from './montarDto.mapper';

@Module({
  imports: [PuppeteerModule.forRoot({ pipe: true })],
  controllers: [ExportaDadosController],
  providers: [ExportaDadosService, ExtrairDadosEsocialService, ExtrairDadosSocService, MontarDtoMapper],
})
export class ExportaDadosModule {}
