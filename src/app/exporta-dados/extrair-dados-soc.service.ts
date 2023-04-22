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

  async extrairDadosFuncionario(retorno, exportaDadosDto) {
    const url = process.env.EXPORTADADOSSOC;
    const client = await soap.createClientAsync(url);
    const funcionarioSemMatricula = [];
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
        const pusMatricula = {
          CNPJ: empresa.CNPJ,
          EMPRESA: empresa.NOMEABREVIADO,
          FUNCIONARIO: semMatricula,
        };

        funcionarioSemMatricula.push(pusMatricula);
      }
    }
    return funcionarioSemMatricula;
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
