import BLOG from '@/blog.config'
import { NotionAPI } from 'notion-client'
import { getDateValue, getTextContent } from 'notion-utils'
import { readCache, writeCache } from '@/lib/notion-cache'
import { idToUuid, resolveCover, mapImageUrl, type Post } from '@/lib/notion'

// ============ API 客户端 ============

const api = new NotionAPI({
  authToken: BLOG.NOTION_ACCESS_TOKEN || undefined,
  userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
})

/**
 * 获取页面 RecordMap（本地缓存优先，过期后重新请求，带重试）
 */
async function fetchPage(pageId: string, retries = 3): Promise<any> {
  // 1. 命中缓存则直接返回
  const cached = readCache(pageId)
  if (cached) {
    console.log(`[Cache] 命中 ${pageId}`)
    return cached
  }

  // 2. 缓存未命中，请求 Notion API
  try {
    const recordMap = await api.getPage(pageId)
    const normalized = normalizeRecordMap(recordMap)
    writeCache(pageId, normalized)
    return normalized
  } catch (e) {
    console.warn(`[Notion] 请求失败 (${pageId})，剩余重试: ${retries - 1}`, e)
    if (retries <= 1) return null
    await new Promise(r => setTimeout(r, 1000))
    return fetchPage(pageId, retries - 1)
  }
}

/**
 * 规范化 recordMap 结构
 * 接口可能返回双层嵌套 { spaceId, value: { value, role } }，
 * 统一转换为 react-notion-x 期望的标准 { value, role } 结构，
 * 避免 SSR 与客户端 hydration 不一致
 */
function normalizeRecordMap(recordMap: any): any {
  if (!recordMap) return recordMap
  const tables = ['block', 'collection', 'collection_view', 'collection_query', 'notion_user', 'space']
  for (const table of tables) {
    const records = recordMap[table]
    if (!records) continue
    for (const id of Object.keys(records)) {
      const record = records[id]
      // 检测双层嵌套：内层同时含有 value 和 role
      if (record?.value && 'value' in record.value && 'role' in record.value) {
        records[id] = record.value
      }
    }
  }
  return recordMap
}

// ============ 数据库解析 ============

/**
 * 解包 record：兼容 { value: { value, role } } 和 { value } 两种嵌套格式
 */
function unwrap(record: any): any {
  if (!record) return null
  return record.value?.value || record.value || record
}

/**
 * 解析页面属性为 key-value
 */
function parseProperties(properties: any, schema: any): Record<string, any> {
  const result: Record<string, any> = {}
  if (!properties || !schema) return result

  for (const [key, val] of Object.entries(properties)) {
    const col = schema[key]
    if (!col) continue
    result[col.name] = getTextContent(val as any)
  }
  return result
}

/**
 * 在 schema 中按列名查找 key
 */
function findSchemaKey(schema: any, name: string): string | undefined {
  return Object.keys(schema).find(k => schema[k]?.name === name)
}

/**
 * 逗号分割多选值
 */
function splitMulti(val?: string): string[] {
  if (!val) return []
  return val.split(',').map(s => s.trim()).filter(Boolean)
}

/**
 * 时间戳转日期字符串
 */
function formatDate(timestamp?: number): string {
  if (!timestamp) return ''
  return new Date(timestamp).toISOString().slice(0, 10)
}

/**
 * 获取所有文章列表
 * 从 Notion 数据库中解析出 type=Post & status=Published 的页面
 */
export async function getPosts(): Promise<Post[]> {
  const pageId = BLOG.NOTION_PAGE_ID
  if (!pageId) {
    console.error('[Notion] 未配置 NOTION_PAGE_ID')
    return []
  }

  const recordMap = await fetchPage(pageId)
  if (!recordMap) return []

  const block = recordMap.block || {}
  const collectionRecord = Object.values(recordMap.collection || {})[0] as any
  const schema = unwrap(collectionRecord)?.schema || {}

  const posts: Post[] = []

  for (const [id, b] of Object.entries<any>(block)) {
    const value = unwrap(b)
    if (!value || value.type !== 'page' || value.parent_table !== 'collection') continue

    const props = parseProperties(value.properties, schema)

    // 只保留已发布的文章
    const type = props[BLOG.NOTION_PROPERTY_NAME.type] || 'Post'
    const status = props[BLOG.NOTION_PROPERTY_NAME.status] || 'Published'
    if (type !== 'Post' || status !== 'Published') continue

    const dateVal = getDateValue(value.properties?.[findSchemaKey(schema, 'date')])

    posts.push({
      id,
      title: getTextContent(value.properties?.title) || '无标题',
      slug: props[BLOG.NOTION_PROPERTY_NAME.slug] || id.replace(/-/g, ''),
      summary: props[BLOG.NOTION_PROPERTY_NAME.summary] || null,
      date: dateVal?.start_date || formatDate(value.created_time) || null,
      tags: splitMulti(props[BLOG.NOTION_PROPERTY_NAME.tags]),
      category: props[BLOG.NOTION_PROPERTY_NAME.category] || null,
      icon: props[BLOG.NOTION_PROPERTY_NAME.icon] || null,
      pageCover: resolveCover(mapImageUrl(value.format?.page_cover, value), props[BLOG.NOTION_PROPERTY_NAME.slug] || id)
    })
  }

  // 按日期倒序
  posts.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
  return posts
}

// ============ 文章详情 ============

/**
 * 根据页面ID获取文章详情（含 blockMap 用于渲染）
 */
export async function getPostById(pageId: string): Promise<Post | null> {
  const recordMap = await fetchPage(pageId)
  if (!recordMap) return null

  const uuid = idToUuid(pageId)
  const value = unwrap(recordMap.block?.[uuid])
  if (!value) return null

  return {
    id: pageId,
    title: getTextContent(value.properties?.title) || '无标题',
    slug: pageId.replace(/-/g, ''),
    date: formatDate(value.last_edited_time || value.created_time) || null,
    pageCover: resolveCover(mapImageUrl(value.format?.page_cover, value), pageId),
    blockMap: recordMap
  }
}

/**
 * 通过 slug 查找文章（先拉列表匹配，再获取详情）
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts()
  const matched = posts.find(p => p.slug === slug)
  if (!matched) return null
  return getPostById(matched.id)
}
