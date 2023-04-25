/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as soap from 'soap';
import { MontarDtoMapper } from './montarDto.mapper';
import 'dotenv/config';

@Injectable()
export class ExtrairDadosSocService {
  constructor(private readonly montarDtoMapper: MontarDtoMapper) {}
  async extrairDados(exportaDadosDto) {
    const url = process.env.EXPORTADADOSSOC;
    const client = await soap.createClientAsync(url);
    const args = await this.montarDtoMapper.montaExportaDados(
      exportaDadosDto.empresa,
    );
    const data = await client.exportaDadosWsAsync(args);
    const dataParse = JSON.parse(data[0].return.retorno);
    const retorno = dataParse.filter((p) => p.ATIVO == '1' && p.CNPJ != '');
    const teste = retorno.slice(1, 50);
    return teste;
  }

  async extrairDadosUnidade(exportaDadosDto) {
    const url = process.env.EXPORTADADOSSOC;
    const client = await soap.createClientAsync(url);
    const args = await this.montarDtoMapper.montaExportaDadosUnidade(
      exportaDadosDto.unidade,
    );
    const data = await client.exportaDadosWsAsync(args);
    const dataParse = JSON.parse(data[0].return.retorno);
    const retorno = dataParse.filter(
      (p) => p.UNIDADEATIVA == '1' && p.CNPJ != '',
    );

    const responstaFormatado = retorno.map((unidade) => {
      return {
        CODIGOEMPRESA: unidade.CODIGOEMPRESA,
        CODIGOUNIDADE: unidade.CODIGOUNIDADE,
        NOMEUNIDADE: unidade.NOMEUNIDADE,
        CNPJUNIDADE: unidade.CNPJUNIDADE,
      };
    });

    return responstaFormatado;
  }

  async extrairDadosFuncionario(retorno, unidade, exportaDadosDto) {
    const url = process.env.EXPORTADADOSSOC;
    const client = await soap.createClientAsync(url);
    const dtoEmpresaUnidade = [];
    const dtoFuncionarioSemMatricula = [];
    const dtoRetornoGeral = [];

    retorno.map((empresa) => {
      const retornoAgrupado = unidade.filter(
        (unidade) => unidade.CODIGOEMPRESA == empresa.CODIGO,
      );

      const dto = {
        empresa: {
          CODIGO: empresa.CODIGO,
          CNPJEMPRESA: empresa.CNPJ,
          NOMEEMPRESA: empresa.NOMEABREVIADO,
          UNIDADES: retornoAgrupado,
        },
      };

      dtoEmpresaUnidade.push(dto);
    });

    for await (const empresa of retorno) {
      const args = await this.montarDtoMapper.montaExportaDadosFuncionario(
        exportaDadosDto.funcionario,
        empresa,
      );
      const data = await client.exportaDadosWsAsync(args);
      const dataParse = JSON.parse(data[0].return.retorno);
      const semMatricula = dataParse.filter(
        (p) => p.MATRICULAFUNCIONARIO == '',
      );

      if (semMatricula.length) {
        dtoFuncionarioSemMatricula.push(...semMatricula);
      }
    }

    dtoEmpresaUnidade.map((p) => {
      p.empresa.UNIDADES.map((unidade) => {
        const buscaFuncionarioUnidade = dtoFuncionarioSemMatricula.filter(
          (funcionario) =>
            funcionario.CODIGOEMPRESA == unidade.CODIGOEMPRESA &&
            funcionario.CODIGOUNIDADE == unidade.CODIGOUNIDADE,
        );
        if (buscaFuncionarioUnidade.length) {
          const dtoGeral = {
            empresa: {
              CODIGO: p.empresa.CODIGO,
              CNPJEMPRESA: p.empresa.CNPJEMPRESA,
              NOMEEMPRESA: p.empresa.NOMEEMPRESA,
              UNIDADES: { ...unidade, FUNCIONARIOS: buscaFuncionarioUnidade },
            },
          };
          dtoRetornoGeral.push(dtoGeral);
        }
      });
    });

    return dtoRetornoGeral;
  }

  async buscarDadosEsocial(funcionarioSemMatricula, exportaDadosDto) {
    for await (const funcionario of funcionarioSemMatricula) {
      if (funcionario.CNPJEMPRESA) {
        const url = process.env.WSDLMODELO2;
        const codigoUsuario = exportaDadosDto.webserviceSOC.codigoUsuario;
        const chaveAcesso = exportaDadosDto.webserviceSOC.chaveAcesso;
        const codigoEmpresaPrincipal =
          exportaDadosDto.webserviceSOC.codigoEmpresaPrincipal;
        const codigoResponsavel =
          exportaDadosDto.webserviceSOC.codigoResponsavel;
        const client = await soap.createClientAsync(url);
        const wsSecurity = new soap.WSSecurity(
          codigoEmpresaPrincipal,
          chaveAcesso,
          {
            passwordType: 'PasswordDigest',
          },
        );
        client.setSecurity(wsSecurity);

        const dto = await this.montarDtoMapper.montaIncluirFuncionarioDto(
          funcionario,
          codigoUsuario,
          chaveAcesso,
          codigoEmpresaPrincipal,
          codigoResponsavel,
        );

        try {
          const funcionarioRetorno = await client.importacaoFuncionarioAsync(
            dto,
          );

          if (funcionarioRetorno[0]?.FuncionarioRetorno?.atualizouFuncionario) {
            const atualizacaoSucesso =
              funcionarioRetorno[0]?.FuncionarioRetorno?.atualizouFuncionario;
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
}
