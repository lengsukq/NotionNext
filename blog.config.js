/**
 * 极简站点配置
 */
const BLOG = {
  // Notion数据库页面ID（必须）
  NOTION_PAGE_ID: process.env.NOTION_PAGE_ID || '',
  // Notion API Token（私有数据库需要）
  NOTION_ACCESS_TOKEN: process.env.NOTION_ACCESS_TOKEN || '',
  // Notion域名
  NOTION_HOST: process.env.NEXT_PUBLIC_NOTION_HOST || 'https://www.notion.so',

  // 站点信息
  TITLE: process.env.NEXT_PUBLIC_TITLE || '冷苏手记',
  DESCRIPTION:
    process.env.NEXT_PUBLIC_DESCRIPTION || '编程铸就思维，思维成就编程',
  AUTHOR: process.env.NEXT_PUBLIC_AUTHOR || '冷苏',
  BIO: process.env.NEXT_PUBLIC_BIO || '全栈开发者 · 前端 / 移动端 / Python / 桌面应用',
  GITHUB: process.env.NEXT_PUBLIC_GITHUB || 'https://github.com/lengsukq',

  // 数据库字段名映射
  NOTION_PROPERTY_NAME: {
    title: 'title',
    slug: 'slug',
    summary: 'summary',
    date: 'date',
    tags: 'tags',
    category: 'category',
    status: 'status',
    type: 'type',
    icon: 'icon'
  },

  // ISR 重新验证间隔（秒）
  REVALIDATE_SECOND: process.env.NEXT_PUBLIC_REVALIDATE_SECOND || 60,

  // 缓存开关：构建打包时默认开启缓存；开发或运行时关闭，方便调试
  ENABLE_CACHE:
    process.env.ENABLE_CACHE
      ? process.env.ENABLE_CACHE === 'true'
      : process.env.npm_lifecycle_event === 'build' ||
        process.env.npm_lifecycle_event === 'export',

  // 文件缓存开关：开启后使用本地 data.json 文件持久化缓存；关闭则使用内存缓存
  // Serverless（Vercel）环境下建议关闭（只读文件系统），本地开发可开启
  ENABLE_FILE_CACHE: process.env.ENABLE_FILE_CACHE === 'true' || false
}

module.exports = BLOG
