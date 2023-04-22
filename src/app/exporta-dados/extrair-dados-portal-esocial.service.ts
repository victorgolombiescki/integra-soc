/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { InjectBrowser } from 'nest-puppeteer';

@Injectable()
export class ExtrairDadosEsocialService {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async extrairDadosPortalEsocial(EmpresasBuscarMatricula) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('https://login.esocial.gov.br/login.aspx');
    await page.waitForSelector('.br-button.sign-in.large');
    await page.click('.br-button.sign-in.large');
    await page.waitForSelector('#cert-digital a');
    await page.click('#cert-digital a');

    for await (const empresa of EmpresasBuscarMatricula) {
      /*const primeiroRegistro = EmpresasBuscarMatricula.indexOf(empresa);
      if (primeiroRegistro == 0) {
        await page.waitForSelector('.alterar-perfil');
        await page.click('.alterar-perfil');
        await page.waitForTimeout(500);
      }
      if (primeiroRegistro > 0) {
        await page.goto('https://www.esocial.gov.br/portal/Home/Index?trocarPerfil=true');
        await page.waitForTimeout(500);
      }*/
      await page.goto(
        'https://www.esocial.gov.br/portal/Home/Index?trocarPerfil=true',
      );
      await page.waitForTimeout(500);
      await page.waitForSelector('#perfilAcesso');
      await page.select('#perfilAcesso', 'PROCURADOR_PJ');
      await page.waitForTimeout(500);
      await page.waitForSelector('#procuradorCnpj');
      await page.type('#procuradorCnpj', empresa.CNPJ);
      await page.waitForTimeout(500);
      await page.click('#btn-verificar-procuracao-cnpj');

      try {
        await page.waitForSelector('#sst');
        await page.waitForTimeout(3000);
        await page.click('#sst');
        await page.waitForTimeout(3000);
        await page.goto(
          'https://frontend.esocial.gov.br/sst/gestaoTrabalhadores',
        );
        for await (const funcionario of empresa.FUNCIONARIO) {
          await page.waitForTimeout(1000);
          await page.waitForSelector('input');
          await page.type('input', funcionario.CPF);
          await page.waitForTimeout(1000);
          const naoEncontrado = await page.$$('#mensagens-gerais > div');
          if (!naoEncontrado.length) {
            await page.waitForSelector('.MuiAutocomplete-popper');
            await page.waitForTimeout(2000);
            await page.click('.MuiAutocomplete-popper');

            await page.setRequestInterception(true);
            page.on('response', async (response) => {
              const status = response.status();
              if (status >= 200 && status < 300) {
                const responseBody = await response.json();
                const cpf = funcionario.CPF.replace(/[^0-9]/g,'');
                const conteudo = { ...responseBody.conteudo.cpf };
                const contratoAtivo = conteudo.filter(
                  (p) => (p = cpf),
                );
                console.log(contratoAtivo);
              }
            });
          }
          await page.waitForTimeout(2000);
          await page.reload();
        }
      } catch (error) {
        console.log('Não liberado');
        continue;
      }
    }
  }
}
