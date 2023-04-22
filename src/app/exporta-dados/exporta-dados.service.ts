import { Injectable } from '@nestjs/common';
import * as soap from 'soap';
import { ExtrairDadosSocService } from './extrair-dados-soc.service';
import { ExtrairDadosEsocialService } from './extrair-dados-portal-esocial.service';

@Injectable()
export class ExportaDadosService {
  constructor(
    private readonly extrairDadosSocService: ExtrairDadosSocService,
    private readonly extrairDadosEsocialService: ExtrairDadosEsocialService,
  ) {}

  async processar(exportaDadosDto) {
    const empresas = await this.extrairDadosSocService.extrairDados(
      exportaDadosDto,
    );
    const EmpresasBuscarMatricula =
      await this.extrairDadosSocService.extrairDadosFuncionario(
        empresas,
        exportaDadosDto,
      );

    const funcioarioMatriculaEsocial =
      await this.extrairDadosEsocialService.extrairDadosPortalEsocial(EmpresasBuscarMatricula);

    /*const atualizarSoc = await this.extrairDadosSocService.buscarDadosEsocial(
      funcionarios,
      exportaDadosDto,
    );*/
  }
}
