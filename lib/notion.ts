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
