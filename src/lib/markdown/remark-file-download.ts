/**
 * Remark plugin to embed file download links in markdown
 *
 * Detects :::download{file="/files/example.txt"} directives and converts them
 * to rich download cards with file metadata (size, type, icon).
 *
 * Uses build-time processing to fetch file metadata and generate static HTML.
 */

import type { Root } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import type { Parent } from 'unist';
import { visit } from 'unist-util-visit';
import type { FileDownloadDirective, RemarkFileDownloadOptions } from './file-download-types';
import { generateFileDownloadHTML, getFileMetadata } from './file-download-utils';

/**
 * 解析指令属性
 *
 * @param node - 容器指令节点
 * @returns 文件下载指令参数
 */
function parseDirectiveAttributes(node: ContainerDirective): FileDownloadDirective {
  const attributes = node.attributes || {};
  return {
    file: attributes.file || '',
    title: attributes.title,
    description: attributes.description,
  };
}

/**
 * Remark plugin that transforms :::download directives into file download cards
 *
 * @param options - Plugin options
 * @returns Remark transformer function
 *
 * @example
 * ```markdown
 * :::download{file="/files/example.txt"}
 * :::
 *
 * :::download{file="/files/example.pdf" title="示例文档" description="这是一个示例PDF文件"}
 * :::
 * ```
 */
export function remarkFileDownload(options: RemarkFileDownloadOptions = {}) {
  const { enableFileDownload = true, publicDir = 'public' } = options;

  return async (tree: Root) => {
    if (!enableFileDownload) return;

    const nodesToReplace: Array<{
      node: ContainerDirective;
      index: number;
      parent: Parent;
      directive: FileDownloadDirective;
    }> = [];

    // First pass: identify download directive nodes
    visit(tree, 'containerDirective', (node: ContainerDirective, index, parent) => {
      if (node.name === 'download' && index !== undefined && parent) {
        const directive = parseDirectiveAttributes(node);

        // Validate that file path is provided
        if (!directive.file) {
          console.warn('[File Download] Missing file path in download directive');
          return;
        }

        nodesToReplace.push({ node, index, parent, directive });
      }
    });

    // Second pass: fetch file metadata in parallel for better performance
    const metadataPromises = nodesToReplace.map(({ directive }) => getFileMetadata(directive.file, publicDir));
    const metadataList = await Promise.all(metadataPromises);

    // Third pass: replace nodes with HTML
    nodesToReplace.forEach(({ index, parent, directive }, i) => {
      const metadata = metadataList[i];
      const html = generateFileDownloadHTML(directive, metadata);

      // Replace the directive node with an HTML node
      parent.children[index] = {
        type: 'html',
        value: html,
      };
    });
  };
}
