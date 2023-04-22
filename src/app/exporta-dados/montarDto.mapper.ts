/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class MontarDtoMapper {
  async montaExportaDados(exportaDadosDto) {
    const dtoExportadados = {
      empresa: exportaDadosDto.empresa,
      codigo: exportaDadosDto.codigo,
      chave: exportaDadosDto.chave,
      tipoSaida: exportaDadosDto.tipoSaida,
    };
    return {
      arg0: {
        erro: {},
        mensagemErro: {},
        parametros: JSON.stringify(dtoExportadados),
        retorno: {},
        tipoArquivoRetorno: 'json',
      },
    };
  }

  async montaExportaDadosFuncionario(exportaDadosDto, empresa) {
    const dtoExportadados = {
      empresa: empresa.CODIGO,
      codigo: exportaDadosDto.codigo,
      chave: exportaDadosDto.chave,
      tipoSaida: exportaDadosDto.tipoSaida,
      ativo: 'Sim',
      inativo: '',
      afastado: '',
      pendente: 'Sim',
      ferias: '',
    };
    return {
      arg0: {
        erro: {},
        mensagemErro: {},
        parametros: JSON.stringify(dtoExportadados),
        retorno: {},
        tipoArquivoRetorno: 'json',
      },
    };
  }

  async montaIncluirFuncionarioDto(
    funcionario,
    codigoUsuario,
    chaveAcesso,
    codigoEmpresaPrincipal,
    codigoResponsavel,
  ) {
    const dto = {
      Funcionario: {
        atualizarFuncionario: true,
        cargoWsVo: {
          codigo: funcionario.CODIGOCARGO,
          tipoBusca: 'CODIGO',
        },
        setorWsVo: {
          codigo: funcionario.CODIGOSETOR,
          tipoBusca: 'CODIGO',
        },
        unidadeWsVo: {
          codigo: funcionario.CODIGOUNIDADE,
          tipoBusca: 'CODIGO',
        },
        funcionarioWsVo: {
          codigo: funcionario.CODIGO,
          chaveProcuraFuncionario: 'CODIGO',
          codigoEmpresa: funcionario.CODIGOEMPRESA,
          matricula: 'MATRICULAFUNCIONARIO1',
          tipoBuscaEmpresa: 'CODIGO_SOC',
        },
        identificacaoWsVo: {
          chaveAcesso,
          codigoEmpresaPrincipal,
          codigoResponsavel,
          homologacao: false,
          codigoUsuario,
        },
        naoImportarFuncionarioSemHierarquia: funcionario.importarSemHierarquia,
      },
    };

    return dto;
  }
}
