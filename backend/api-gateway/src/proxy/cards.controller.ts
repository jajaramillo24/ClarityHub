import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { ProjectGuard } from '../projects/project.guard';

@UseGuards(ProjectGuard)
@Controller('cards')
export class CardsProxyController {
  private readonly targetBaseUrl: string;

  constructor(
    private readonly proxy: ProxyService,
    config: ConfigService,
  ) {
    this.targetBaseUrl = config.get<string>(
      'STRUCTURE_SERVICE_URL',
      'http://localhost:3003',
    );
  }

  @All()
  forwardRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(this.targetBaseUrl, req, res);
  }

  @All('*splat')
  forwardNested(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(this.targetBaseUrl, req, res);
  }
}
