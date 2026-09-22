import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8MB decoded
// Base64 expands the payload by ~4/3 — cap the encoded string length so a
// decoded attachment can never exceed MAX_ATTACHMENT_BYTES. Without this,
// nothing stops a client from sending an arbitrarily large payload that
// fills the database or ties up the request (main.ts's body parser limit
// is a blunter, earlier backstop for the same problem).
const MAX_BASE64_LENGTH = Math.ceil((MAX_ATTACHMENT_BYTES * 4) / 3);

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
  @MaxLength(MAX_BASE64_LENGTH, {
    message: `Attachment exceeds the ${MAX_ATTACHMENT_BYTES / (1024 * 1024)}MB limit`,
  })
  base64: string;
}
