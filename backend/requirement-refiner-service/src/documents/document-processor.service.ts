import { Injectable, Logger } from '@nestjs/common';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { AttachmentRef } from '../types';

const WORD_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];
const WORD_EXTENSIONS = ['.doc', '.docx'];

const EXCEL_MIMES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const EXCEL_EXTENSIONS = ['.xls', '.xlsx'];

export function isWordDocument(mimeType: string, fileName: string): boolean {
  return (
    WORD_MIMES.includes(mimeType) ||
    WORD_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext))
  );
}

export function isExcelDocument(mimeType: string, fileName: string): boolean {
  return (
    EXCEL_MIMES.includes(mimeType) ||
    EXCEL_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext))
  );
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  async extractTextFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  extractTextFromExcel(buffer: Buffer): string {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let extractedText = '';

    workbook.SheetNames.forEach((sheetName, index) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      }) as unknown[][];

      if (index > 0) extractedText += '\n\n';
      extractedText += `Sheet: ${sheetName}\n---\n`;

      for (const row of sheetData) {
        const rowText = row
          .map((cell) => (cell !== null && cell !== undefined ? String(cell) : ''))
          .join(' | ');
        if (rowText.trim()) {
          extractedText += rowText + '\n';
        }
      }
    });

    return extractedText || 'No content found in Excel file';
  }

  /**
   * Extracts text from Word/Excel attachments; returns null for anything else
   * (images are handled separately as inline vision content).
   */
  async processAttachment(attachment: AttachmentRef): Promise<string | null> {
    try {
      const buffer = Buffer.from(attachment.base64, 'base64');
      if (isWordDocument(attachment.mimeType, attachment.name)) {
        return await this.extractTextFromDocx(buffer);
      }
      if (isExcelDocument(attachment.mimeType, attachment.name)) {
        return this.extractTextFromExcel(buffer);
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to process ${attachment.name}`, error as Error);
      return null;
    }
  }
}
