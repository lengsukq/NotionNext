import fs from 'fs'
import path from 'path'
import BLOG from '@/blog.config'

/**
 * 文件缓存 —— 基于本地 JSON 文件
 * 所有缓存条目存储在同一个 data.json 中（匹配 NotionNext 官方实现）
 */

const CACHE_FILE = path.resolve('./data.json')
const CACHE_TTL = (Number(BLOG.REVALIDATE_SECOND) || 60) * 1000

function readStore(): Record<string, any> {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {}
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeStore(data: Record<string, any>): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
  } catch (e) {
    console.warn('[FileCache] 写入缓存文件失败', e)
  }
}

export function getCache(key: string): any | null {
  try {
    const store = readStore()
    const entry = store[key]
    if (!entry) return null

    // TTL 检查
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      delete store[key]
      writeStore(store)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCache(key: string, data: any): void {
  try {
    const store = readStore()
    store[key] = { timestamp: Date.now(), data }
    writeStore(store)
  } catch (e) {
    console.warn('[FileCache] 写入缓存失败', e)
  }
}

export function delCache(key: string): void {
  try {
    const store = readStore()
    delete store[key]
    writeStore(store)
  } catch {
    // ignore
  }
}
