/**
 * File Download Types
 *
 * Type definitions for the file download feature.
 */

/**
 * 文件下载指令的参数接口
 */
export interface FileDownloadDirective {
  /** 文件路径，必需，如 "/files/example.txt" */
  file: string;
  /** 自定义标题，可选 */
  title?: string;
  /** 文件描述，可选 */
  description?: string;
}

/**
 * 文件类型枚举
 */
export type FileType =
  | 'text' // .txt
  | 'pdf' // .pdf
  | 'archive' // .zip, .rar, .7z
  | 'image' // .png, .jpg, .jpeg, .gif, .webp
  | 'audio' // .mp3, .wav, .flac
  | 'video' // .mp4, .avi, .mov
  | 'document' // .doc, .docx
  | 'spreadsheet' // .xls, .xlsx
  | 'code' // .js, .ts, .py, .java, etc.
  | 'generic'; // 未知类型

/**
 * 文件元数据接口
 */
export interface FileMetadata {
  /** 文件路径 */
  path: string;
  /** 文件名（不含路径） */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 格式化的文件大小（如 "1.23 MB"） */
  sizeFormatted: string;
  /** 文件扩展名（如 "txt"） */
  extension: string;
  /** 文件类型枚举 */
  type: FileType;
  /** 文件是否存在 */
  exists: boolean;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 插件选项接口
 */
export interface RemarkFileDownloadOptions {
  /** 是否启用文件下载功能，默认 true */
  enableFileDownload?: boolean;
  /** public 目录路径，默认 'public' */
  publicDir?: string;
  /** 允许的文件扩展名列表，默认允许所有 */
  allowedExtensions?: string[];
}
