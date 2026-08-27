import { All, Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller('attachments')
export class AttachmentsProxyController {
  private readonly targetBaseUrl: string;

  constructor(
    private readonly proxy: ProxyService,
    config: ConfigService,
  ) {
    this.targetBaseUrl = config.get<string>(
      'IDEA_BOARD_SERVICE_URL',
      'http://localhost:3001',
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
