/**
 * Notion 数据缓存
 *
 * 桥接模块：将 cache manager 的操作适配为 notion-server 使用的 readCache / writeCache API。
 * 缓存键统一使用页面 ID（去连字符）。
 *
 * 参考：main 分支的 lib/cache/cache_manager.js
 */
import { getCache, setCache } from '@/lib/cache'

function normalizeKey(pageId: string): string {
  return `notion:${pageId.replace(/-/g, '')}`
}

export function readCache(pageId: string): any | null {
  return getCache(normalizeKey(pageId))
}

export function writeCache(pageId: string, data: any): void {
  setCache(normalizeKey(pageId), data)
}
