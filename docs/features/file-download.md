# 文件下载功能

## 概述

文件下载功能允许你在 Markdown 文章中嵌入可下载的文件链接。系统会自动生成美观的下载卡片，显示文件信息（名称、大小、类型图标），并完美适配博客的亮/暗主题。

## 特性

- ✅ **简单易用**: 使用简单的 Markdown 指令语法
- ✅ **自动元数据**: 构建时自动获取文件大小和类型
- ✅ **主题适配**: 完美融合博客主题，支持亮/暗模式切换
- ✅ **多种文件类型**: 支持文本、PDF、压缩包、图片、音视频等多种文件类型图标
- ✅ **响应式设计**: 在桌面和移动设备上都有良好的显示效果
- ✅ **可访问性**: 支持键盘导航和屏幕阅读器
- ✅ **安全可靠**: 严格的路径验证，防止安全漏洞
- ✅ **零运行时开销**: 构建时处理，生成纯静态 HTML

## 使用方法

### 基本语法

在 Markdown 文章中使用 `:::download` 指令：

```markdown
:::download{file="/files/example.txt"}
:::
```

### 自定义标题和描述

你可以添加自定义标题和描述：

```markdown
:::download{file="/files/example.pdf" title="示例文档" description="这是一个示例PDF文件"}
:::
```

### 参数说明

- `file` (必需): 文件路径，必须以 `/files/` 开头
- `title` (可选): 自定义标题，如果不提供则使用文件名
- `description` (可选): 文件描述，显示在卡片中

## 文件存储

所有可下载的文件应该存储在 `public/files/` 目录下。例如：

```plain
public/
└── files/
    ├── example.txt
    ├── document.pdf
    └── archive.zip
```

## 支持的文件类型

系统会根据文件扩展名自动显示对应的图标：

| 文件类型 | 扩展名 | 图标 |
|---------|--------|------|
| 文本文件 | .txt | 📄 |
| PDF 文档 | .pdf | 📕 |
| 压缩包 | .zip, .rar, .7z | 📦 |
| 图片 | .png, .jpg, .jpeg, .gif, .webp | 🖼️ |
| 音频 | .mp3, .wav, .flac | 🎵 |
| 视频 | .mp4, .avi, .mov | 🎬 |
| Word 文档 | .doc, .docx | 📝 |
| Excel 表格 | .xls, .xlsx | 📊 |
| 代码文件 | .js, .ts, .py, .java, etc. | 💻 |
| 其他 | 其他扩展名 | 📄 |

## 示例

### 示例 1: 简单文本文件

```markdown
:::download{file="/files/readme.txt"}
:::
```

### 示例 2: 带标题和描述的 PDF

```markdown
:::download{file="/files/report.pdf" title="年度报告" description="2024年度工作总结报告"}
:::
```

### 示例 3: 压缩包

```markdown
:::download{file="/files/source-code.zip" title="源代码" description="项目完整源代码，包含所有依赖"}
:::
```

## 配置选项

在 `astro.config.mjs` 中，你可以配置文件下载插件：

```javascript
import { remarkFileDownload } from './src/lib/markdown/remark-file-download.ts';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkDirective,
      [
        remarkFileDownload,
        {
          enableFileDownload: true,  // 是否启用功能
          publicDir: 'public',        // public 目录路径
        },
      ],
    ],
  },
});
```

## 样式定制

下载卡片使用 Tailwind CSS 类名和 CSS 变量，你可以通过修改 `src/styles/components/file-download.css` 来定制样式。

## 安全注意事项

1. **路径限制**: 文件路径必须以 `/files/` 开头，系统会自动验证路径安全性
2. **路径遍历防护**: 系统会拒绝包含 `..` 或 `~` 的路径
3. **HTML 转义**: 所有用户输入都会进行 HTML 转义，防止 XSS 攻击

## 故障排除

### 文件未找到

如果看到"文件未找到"错误：

1. 检查文件是否存在于 `public/files/` 目录下
2. 确认文件路径拼写正确
3. 确保路径以 `/files/` 开头

### 样式不正确

如果下载卡片样式不正确：

1. 确认已导入样式文件到 `src/styles/index.css`
2. 运行 `pnpm build` 重新构建
3. 清除浏览器缓存

### 构建错误

如果构建时出现错误：

1. 检查 `remark-directive` 是否已安装
2. 确认 Astro 配置中已添加插件
3. 查看控制台错误日志

## 技术实现

文件下载功能使用以下技术实现：

- **remark 插件**: 解析 Markdown 中的 `:::download` 指令
- **构建时处理**: 在构建时获取文件元数据，生成静态 HTML
- **无运行时开销**: 不需要客户端 JavaScript
- **主题变量**: 使用 CSS 变量自动适配亮/暗主题

## 相关文件

- `src/lib/markdown/remark-file-download.ts` - remark 插件
- `src/lib/markdown/file-download-utils.ts` - 工具函数
- `src/lib/markdown/file-download-types.ts` - TypeScript 类型定义
- `src/styles/components/file-download.css` - 样式文件
- `astro.config.mjs` - Astro 配置
