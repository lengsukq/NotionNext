import { getTextContent } from 'notion-utils'
import { useEffect, useMemo, useRef, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: 1 | 2 | 3
}

/**
 * 查找标题对应的 DOM 元素
 * react-notion-x 用 class="notion-block-{uuid}"（带连字符）标记块
 */
function findBlockEl(id: string): Element | null {
  return (
    document.querySelector(`.notion-block-${id}`) ||
    document.querySelector(`[data-block-id="${id}"]`) ||
    document.getElementById(id)
  )
}

/**
 * 从 blockMap 中提取标题块生成目录
 */
function extractToc(blockMap: any): TocItem[] {
  const blocks = blockMap?.block || {}
  const items: TocItem[] = []
  const typeLevel: Record<string, 1 | 2 | 3> = {
    header: 1,
    sub_header: 2,
    sub_sub_header: 3
  }

  for (const [id, b] of Object.entries<any>(blocks)) {
    const value = b?.value?.value || b?.value || b
    if (!value?.type || !typeLevel[value.type]) continue
    const text = getTextContent(value.properties?.title)
    if (!text) continue
    items.push({ id, text, level: typeLevel[value.type] })
  }

  // 按页面内出现顺序排序：利用 parent block 的 content 数组
  const rootBlock = Object.values<any>(blocks).find((b: any) => {
    const v = b?.value?.value || b?.value || b
    return v?.content?.length > 0 && (v.type === 'page' || v.type === 'collection_view_page')
  })
  const rootValue = rootBlock?.value?.value || rootBlock?.value || rootBlock
  if (rootValue?.content) {
    const order = new Map<string, number>()
    const walk = (ids: string[]) => {
      for (const cid of ids) {
        order.set(cid, order.size)
        const child = blocks[cid]
        const cv = child?.value?.value || child?.value || child
        if (cv?.content) walk(cv.content)
      }
    }
    walk(rootValue.content)
    items.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
  }

  return items.slice(0, 30)
}

/**
 * 文章目录 · 桌面端右侧悬浮 + 移动端浮动抽屉
 */
export default function Toc({ blockMap }: { blockMap: any }) {
  const items = useMemo(() => extractToc(blockMap), [blockMap])
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // 监听标题可见性
  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    // react-notion-x 渲染的标题带有 notion-block-{uuid} 类名
    const timers: ReturnType<typeof setTimeout>[] = []
    const observe = () => {
      let found = 0
      for (const item of items) {
        const el = findBlockEl(item.id)
        if (el) {
          observer.observe(el)
          found++
        }
      }
      return found
    }

    // 等待 react-notion-x 渲染完成
    if (observe() === 0) {
      const t = setTimeout(observe, 800)
      timers.push(t)
    }

    return () => {
      observer.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [items])

  // 滚动进入正文后再显示目录（避免首屏 Hero 被遮挡），回到顶部自动隐藏
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -45% 0px', threshold: 0 }
    )
    io.observe(article)
    return () => io.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = findBlockEl(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
    setMobileOpen(false)
  }

  if (items.length < 2) return null

  const activeIndex = items.findIndex(i => i.id === activeId)

  const tocList = (
    <div ref={listRef} className='relative space-y-0.5'>
      {/* 朱砂指示线 */}
      {activeIndex >= 0 && (
        <span
          className='toc-indicator'
          style={{ top: `${activeIndex * 28 + 6}px` }}
        />
      )}
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className={`block w-full truncate rounded-r-md py-1 text-left text-xs leading-[20px] tracking-[0.06em] transition-all duration-300 ${
            item.level === 1 ? 'pl-4' : item.level === 2 ? 'pl-7' : 'pl-10'
          } ${
            activeId === item.id
              ? 'font-medium text-cinnabar'
              : 'text-ink-faint hover:text-ink-soft'
          }`}
          style={{ height: '28px' }}>
          {item.text}
        </button>
      ))}
    </div>
  )

  return (
    <>
      {/* 桌面端 · 右侧固定目录（进入正文后从右侧滑入） */}
      <aside
        className={`fixed right-6 top-1/2 z-40 hidden w-52 -translate-y-1/2 transition-all duration-500 xl:block ${
          visible ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'
        }`}>
        <div className='max-h-[60vh] overflow-y-auto rounded-xl border border-line/70 bg-paper/80 p-4 shadow-[0_8px_32px_rgba(46,43,36,0.08)] backdrop-blur-md'>
          <p className='mb-3 flex items-center gap-2 text-[10px] tracking-[0.3em] text-ink-faint'>
            <span className='text-cinnabar'>☰</span> 目录
          </p>
          {tocList}
        </div>
      </aside>

      {/* 移动端 · 浮动按钮 + 抽屉 */}
      <div className={`transition-all duration-500 xl:hidden ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`fixed bottom-20 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-400 ${
            mobileOpen
              ? 'border-cinnabar bg-cinnabar text-paper'
              : 'border-line bg-paper/90 text-ink-soft'
          }`}
          aria-label='目录'>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
            <path d='M2 3.5h12M2 8h8M2 12.5h10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          </svg>
        </button>

        {/* 抽屉面板 */}
        <div
          className={`fixed bottom-36 right-5 z-50 w-64 origin-bottom-right rounded-xl border border-line bg-paper/95 p-4 shadow-[0_16px_48px_rgba(46,43,36,0.15)] backdrop-blur-md transition-all duration-350 ${
            mobileOpen
              ? 'translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-3 scale-95 opacity-0'
          }`}>
          <p className='mb-3 flex items-center gap-2 text-[10px] tracking-[0.3em] text-ink-faint'>
            <span className='text-cinnabar'>☰</span> 目录
          </p>
          <div className='max-h-[40vh] overflow-y-auto'>{tocList}</div>
        </div>
      </div>
    </>
  )
}
