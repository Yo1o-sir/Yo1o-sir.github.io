/**
 * File Download Utilities
 *
 * Utility functions for the file download feature.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { FileMetadata, FileType } from './file-download-types';

/**
 * 格式化文件大小
 *
 * @param bytes - 文件大小（字节）
 * @returns 格式化的文件大小字符串
 *
 * @example
 * formatFileSize(500) // "500 B"
 * formatFileSize(2048) // "2.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 根据扩展名确定文件类型
 *
 * @param extension - 文件扩展名（不含点号）
 * @returns 文件类型枚举
 *
 * @example
 * getFileType('txt') // 'text'
 * getFileType('pdf') // 'pdf'
 * getFileType('unknown') // 'generic'
 */
export function getFileType(extension: string): FileType {
  const typeMap: Record<string, FileType> = {
    txt: 'text',
    pdf: 'pdf',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    mp3: 'audio',
    wav: 'audio',
    flac: 'audio',
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    doc: 'document',
    docx: 'document',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    js: 'code',
    ts: 'code',
    py: 'code',
    java: 'code',
    cpp: 'code',
    c: 'code',
    go: 'code',
    rs: 'code',
  };

  return typeMap[extension.toLowerCase()] || 'generic';
}

/**
 * HTML 转义函数
 *
 * @param text - 需要转义的文本
 * @returns 转义后的文本
 *
 * @example
 * escapeHtml('<script>') // "&lt;script&gt;"
 * escapeHtml('A & B') // "A &amp; B"
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 验证路径安全性
 *
 * @param filePath - 文件路径
 * @returns 路径是否安全
 *
 * @example
 * isPathSafe('/files/example.txt') // true
 * isPathSafe('/files/../etc/passwd') // false
 * isPathSafe('/etc/passwd') // false
 */
export function isPathSafe(filePath: string): boolean {
  // 必须以 /files/ 开头
  if (!filePath.startsWith('/files/')) {
    return false;
  }

  // 不能包含路径遍历字符
  if (filePath.includes('..') || filePath.includes('~')) {
    return false;
  }

  // 规范化路径后应该仍然在 /files/ 下
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith('/files/')) {
    return false;
  }

  return true;
}

/**
 * 创建错误元数据
 *
 * @param filePath - 文件路径
 * @param error - 错误信息
 * @returns 错误元数据对象
 */
export function createErrorMetadata(filePath: string, error: string): FileMetadata {
  return {
    path: filePath,
    name: path.basename(filePath),
    size: 0,
    sizeFormatted: '0 B',
    extension: '',
    type: 'generic',
    exists: false,
    error,
  };
}

/**
 * 获取文件元数据
 *
 * @param filePath - 文件路径（相对于 public 目录）
 * @param publicDir - public 目录路径
 * @returns 文件元数据
 */
export async function getFileMetadata(filePath: string, publicDir: string): Promise<FileMetadata> {
  // 验证路径安全性
  if (!isPathSafe(filePath)) {
    console.error(`[File Download] Unsafe path detected: ${filePath}`);
    return createErrorMetadata(filePath, 'Unsafe path');
  }

  // 构建完整路径
  const fullPath = path.join(process.cwd(), publicDir, filePath);

  // 检查文件是否存在
  try {
    const stats = await fs.promises.stat(fullPath);
    const extension = path.extname(filePath).slice(1).toLowerCase();
    const name = path.basename(filePath);

    return {
      path: filePath,
      name,
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      extension,
      type: getFileType(extension),
      exists: true,
    };
  } catch (error) {
    console.error(`[File Download] File not found: ${filePath}`);
    return createErrorMetadata(filePath, 'File not found');
  }
}

/**
 * 获取文件类型图标 SVG
 *
 * @param type - 文件类型
 * @returns SVG 图标字符串
 */
export function getFileTypeIcon(type: FileType): string {
  const icons: Record<FileType, string> = {
    text: '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    pdf: '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    archive:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>',
    image:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    audio:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>',
    video:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    document:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    spreadsheet:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    code: '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
    generic:
      '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  };

  return icons[type];
}

/**
 * 生成文件下载 HTML
 *
 * @param directive - 下载指令参数
 * @param metadata - 文件元数据
 * @returns HTML 字符串
 */
export function generateFileDownloadHTML(
  directive: { file: string; title?: string; description?: string },
  metadata: FileMetadata,
): string {
  if (!metadata.exists) {
    return generateErrorHTML(directive.file);
  }

  const title = directive.title || metadata.name;
  const description = directive.description;
  const icon = getFileTypeIcon(metadata.type);

  // 转义 HTML 以防止 XSS
  const safeTitle = escapeHtml(title);
  const safeDescription = description ? escapeHtml(description) : '';
  const safePath = escapeHtml(metadata.path);
  const safeSize = escapeHtml(metadata.sizeFormatted);

  return `<div class="file-download-block not-prose my-6">
  <a 
    href="${safePath}" 
    download 
    class="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
    aria-label="下载文件: ${safeTitle}, 大小: ${safeSize}"
  >
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        ${icon}
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-foreground font-semibold truncate">${safeTitle}</div>
        ${safeDescription ? `<div class="text-muted-foreground text-sm mt-1 line-clamp-2">${safeDescription}</div>` : ''}
        <div class="text-muted-foreground text-xs mt-1">${safeSize} · ${metadata.extension.toUpperCase()}</div>
      </div>
      <svg class="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
    </div>
  </a>
</div>`;
}

/**
 * 生成错误 HTML
 *
 * @param filePath - 文件路径
 * @returns HTML 字符串
 */
export function generateErrorHTML(filePath: string): string {
  const safePath = escapeHtml(filePath);
  return `<div class="file-download-block not-prose my-6">
  <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
    <div class="flex items-center gap-3">
      <svg class="h-5 w-5 shrink-0 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div class="text-sm">
        <div class="font-semibold text-destructive">文件未找到</div>
        <div class="text-muted-foreground mt-1">路径: ${safePath}</div>
      </div>
    </div>
  </div>
</div>`;
}
