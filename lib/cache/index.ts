import BLOG from '@/blog.config'
import * as fileCache from './file-cache'
import * as memoryCache from './memory-cache'

/**
 * 缓存管理器
 *
 * - 当 ENABLE_FILE_CACHE 环境变量为 true（且非 Serverless 环境），使用本地 JSON 文件持久化缓存
 * - 否则使用内存缓存（memory-cache），适合 Vercel 等只读文件系统的 Serverless 环境
 */

function getEngine(): typeof fileCache {
  if (BLOG.ENABLE_FILE_CACHE) {
    return fileCache
  }
  return memoryCache
}

const engine = getEngine()

/**
 * 检查缓存是否启用（构建打包时默认开启，开发运行时关闭效果更好）
 */
export function isCacheEnabled(): boolean {
  return BLOG.ENABLE_CACHE
}

/**
 * 从缓存获取数据
 */
export function getCache(key: string): any | null {
  if (!isCacheEnabled()) return null
  return engine.getCache(key)
}

/**
 * 写入缓存
 */
export function setCache(key: string, data: any): void {
  if (!isCacheEnabled() || !data) return
  engine.setCache(key, data)
}

/**
 * 删除缓存
 */
export function delCache(key: string): void {
  if (!isCacheEnabled()) return
  engine.delCache(key)
}
