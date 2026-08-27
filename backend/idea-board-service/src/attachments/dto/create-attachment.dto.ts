import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  // Raw base64 payload, no data: URI prefix (same contract the frontend already uses).
  @IsString()
  @IsNotEmpty()
  base64: string;
}
