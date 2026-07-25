import BLOG from '@/blog.config'

// ============ 类型定义 ============

export interface Post {
  id: string
  title: string
  slug: string
  summary?: string
  date?: string
  tags?: string[]
  category?: string
  icon?: string
  pageCover?: string
  blockMap?: any
  /** Notion 页面 emoji 图标（format.page_icon） */
  pageIcon?: string
  /** 正文字数 */
  wordCount?: number
  /** 预估阅读分钟数 */
  readMinutes?: number
  /** 最后编辑日期 */
  lastEdited?: string
  /** 标签 → Notion 颜色名 */
  tagColors?: Record<string, string>
  /** 分类 Notion 颜色名 */
  categoryColor?: string
}

// ============ 工具函数 ============

/**
 * Notion UUID 格式化（32位hex → 带连字符的uuid）
 */
export function idToUuid(id: string): string {
  if (!id) return ''
  if (id.includes('-')) return id
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
}

/**
 * 封面图兜底：无封面或已停服的图床（source.unsplash.com 已于 2023 年关闭）
 * 回退到 picsum.photos，以 slug 为种子保证同一篇文章封面稳定一致
 */
export function resolveCover(url?: string | null, seed?: string): string {
  if (!url || url.includes('source.unsplash.com')) {
    return `https://picsum.photos/seed/${seed || 'blog'}/1600/900`
  }
  return url
}

/**
 * 图片URL映射：相对路径补全域名，私有图床走 Notion 代理
 */
export function mapImageUrl(img?: string, block?: any): string | undefined {
  if (!img) return undefined

  let url = img
  if (img.startsWith('/')) {
    url = BLOG.NOTION_HOST + img
  }

  // Notion 私有图床需要走代理
  if (url.includes('secure.notion-static.com') || url.includes('prod-files-secure')) {
    url = `${BLOG.NOTION_HOST}/image/${encodeURIComponent(url)}?table=block&id=${block?.id || ''}`
  }

  return url
}

// ============ Notion 颜色映射 ============

/**
 * Notion 颜色名 → 文艺风低饱和色 Tailwind 类名
 * 返回 [文字色, 背景色, 边框色]
 */
const NOTION_COLOR_MAP: Record<string, [string, string, string]> = {
  red: ['text-[#a8442e]', 'bg-[#a8442e]/10', 'border-[#a8442e]/30'],
  pink: ['text-[#a05268]', 'bg-[#a05268]/10', 'border-[#a05268]/30'],
  purple: ['text-[#7b5ea7]', 'bg-[#7b5ea7]/10', 'border-[#7b5ea7]/30'],
  blue: ['text-[#4a6fa5]', 'bg-[#4a6fa5]/10', 'border-[#4a6fa5]/30'],
  green: ['text-[#4e7a5a]', 'bg-[#4e7a5a]/10', 'border-[#4e7a5a]/30'],
  orange: ['text-[#b0713a]', 'bg-[#b0713a]/10', 'border-[#b0713a]/30'],
  yellow: ['text-[#9a7b2e]', 'bg-[#9a7b2e]/10', 'border-[#9a7b2e]/30'],
  brown: ['text-[#7a5c3e]', 'bg-[#7a5c3e]/10', 'border-[#7a5c3e]/30'],
  gray: ['text-[#6f6a5c]', 'bg-[#6f6a5c]/10', 'border-[#6f6a5c]/30'],
  default: ['text-[#6f6a5c]', 'bg-[#6f6a5c]/8', 'border-[#6f6a5c]/25']
}

/**
 * 获取 Notion 颜色对应的 Tailwind 类名组
 * @param color Notion 颜色名（red/purple/orange...）
 * @param slot 0=文字色 1=背景色 2=边框色
 */
export function notionColorClass(color?: string, slot: 0 | 1 | 2 = 0): string {
  const mapped = NOTION_COLOR_MAP[color || 'default'] || NOTION_COLOR_MAP.default
  return mapped[slot]
}

/**
 * 估算阅读时长（中文约 400 字/分钟）
 */
export function estimateReadMinutes(wordCount?: number): number {
  if (!wordCount) return 1
  return Math.max(1, Math.round(wordCount / 400))
}
