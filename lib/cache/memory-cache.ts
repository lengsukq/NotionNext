import cache from 'memory-cache'
import BLOG from '@/blog.config'

/**
 * 内存缓存 —— 基于 memory-cache 包
 * 适合 Serverless 环境（Vercel 等），每个请求独立，写文件不可用时的兜底方案
 */

const CACHE_TTL_MS = (Number(BLOG.REVALIDATE_SECOND) || 60) * 1000

export function getCache(key: string): any | null {
  const data = cache.get(key)
  return data !== null && data !== undefined ? data : null
}

export function setCache(key: string, data: any): void {
  cache.put(key, data, CACHE_TTL_MS)
}

export function delCache(key: string): void {
  cache.del(key)
}
