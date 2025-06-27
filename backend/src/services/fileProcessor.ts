import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import fs from 'fs'

export interface ProcessedFile {
  text: string
  metadata: {
    pageCount?: number
    wordCount: number
    characterCount: number
  }
}

export class FileProcessor {
  static async processFile(filePath: string, fileType: string): Promise<ProcessedFile> {
    try {
      let text: string
      let metadata: any = {}

      switch (fileType.toLowerCase()) {
        case 'pdf':
          text = await this.processPDF(filePath)
          break
        case 'docx':
          text = await this.processDOCX(filePath)
          break
        case 'txt':
          text = await this.processTXT(filePath)
          break
        default:
          throw new Error(`Unsupported file type: ${fileType}`)
      }

      // Calculate metadata
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
      const characterCount = text.length

      return {
        text: text.trim(),
        metadata: {
          ...metadata,
          wordCount,
          characterCount
        }
      }
    } catch (error) {
      console.error('File processing error:', error)
      throw new Error(`Failed to process ${fileType} file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static async processPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdf(dataBuffer)
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text content found in PDF file')
      }
      
      return data.text
    } catch (error) {
      console.error('PDF processing error:', error)
      throw new Error('Failed to extract text from PDF file')
    }
  }

  private static async processDOCX(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      const result = await mammoth.extractRawText({ buffer: dataBuffer })
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content found in DOCX file')
      }
      
      return result.value
    } catch (error) {
      console.error('DOCX processing error:', error)
      throw new Error('Failed to extract text from DOCX file')
    }
  }

  private static async processTXT(filePath: string): Promise<string> {
    try {
      const text = fs.readFileSync(filePath, 'utf-8')
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in TXT file')
      }
      
      return text
    } catch (error) {
      console.error('TXT processing error:', error)
      throw new Error('Failed to read TXT file')
    }
  }

  static validateFile(fileSize: number, fileType: string): { valid: boolean; error?: string } {
    // File size limit: 10MB
    const maxSize = 10 * 1024 * 1024
    if (fileSize > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit'
      }
    }

    // Supported file types
    const supportedTypes = ['pdf', 'docx', 'txt']
    if (!supportedTypes.includes(fileType.toLowerCase())) {
      return {
        valid: false,
        error: `Unsupported file type. Supported types: ${supportedTypes.join(', ')}`
      }
    }

    return { valid: true }
  }

  static extractFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase()
    if (!extension) {
      throw new Error('File must have an extension')
    }
    return extension
  }
} 