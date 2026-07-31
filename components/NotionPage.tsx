import { mapImageUrl } from '@/lib/notion'
import dynamic from 'next/dynamic'
import { NotionRenderer } from 'react-notion-x'
import BlockReveal from '@/components/BlockReveal'
// Collection 必须静态导入：页面属于 collection 时服务端会渲染页面属性表，
// 若用 dynamic 懒加载会导致客户端 hydration 不一致
import { Collection } from 'react-notion-x/build/third-party/collection'

/**
 * Notion 页面渲染器
 * 使用 react-notion-x 将 blockMap 渲染为网页，正文块随滚动逐段浮现
 */
const NotionPage = ({ blockMap, className }: { blockMap: any; className?: string }) => {
  if (!blockMap) return null

  return (
    <div className={`mx-auto ${className || ''}`}>
      <BlockReveal>
        <NotionRenderer
          recordMap={blockMap}
          mapPageUrl={mapPageUrl}
          mapImageUrl={mapImageUrl}
          fullPage={false}
          previewImages={false}
          components={{
            Code,
            Collection,
            Equation,
            Modal,
            Pdf
          }}
        />
      </BlockReveal>
    </div>
  )
}

/**
 * 页面内链接映射
 */
const mapPageUrl = (id: string) => `/post/${id.replace(/-/g, '')}`

// 代码高亮
const Code = dynamic(
  () => import('react-notion-x/build/third-party/code').then(m => m.Code),
  { ssr: false }
)

// 数据库集合（静态导入，避免 hydration 不一致）

// 数学公式
const Equation = dynamic(
  () => import('react-notion-x/build/third-party/equation').then(m => m.Equation),
  { ssr: false }
)

// PDF 嵌入
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then(m => m.Pdf),
  { ssr: false }
)

// 弹窗
const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then(m => m.Modal),
  { ssr: false }
)

export default NotionPage
