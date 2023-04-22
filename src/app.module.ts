import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExportaDadosModule } from './app/exporta-dados/exporta-dados.module';
import { PuppeteerModule } from 'nest-puppeteer';

@Module({
  imports: [PuppeteerModule.forRoot({ pipe: true }), ExportaDadosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
