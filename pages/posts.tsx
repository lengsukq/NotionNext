import BLOG from '@/blog.config'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { getPosts } from '@/lib/notion-server'
import { notionColorClass, type Post } from '@/lib/notion'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  posts: Post[]
}

type ViewMode = 'vertical' | 'horizontal'

const PAGE_SIZE = 10

/**
 * 全部文章页 · 搜索 + 分类/标签筛选 + 竖向/横向时间线切换 + 自动加载更多
 */
export default function AllPosts({ posts }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('vertical')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [switching, setSwitching] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 分类与标签集合（带颜色）
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    posts.forEach(p => {
      if (p.category && !map.has(p.category)) map.set(p.category, p.categoryColor || 'default')
    })
    return [...map.entries()]
  }, [posts])

  const tags = useMemo(() => {
    const map = new Map<string, string>()
    posts.forEach(p => {
      p.tags?.forEach(t => {
        if (!map.has(t)) map.set(t, p.tagColors?.[t] || 'default')
      })
    })
    return [...map.entries()]
  }, [posts])

  // 搜索 + 筛选
  const filtered = useMemo(() => {
    let list = posts
    if (activeCategory) list = list.filter(p => p.category === activeCategory)
    if (activeTag) list = list.filter(p => p.tags?.includes(activeTag))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q)) ||
          p.category?.toLowerCase().includes(q)
      )
    }
    return list
  }, [posts, query, activeCategory, activeTag])

  // 筛选变化时重置加载数量
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, activeCategory, activeTag])

  // 自动加载更多（IntersectionObserver）
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [filtered.length])

  // 视图切换动画
  const switchView = (mode: ViewMode) => {
    if (mode === view) return
    setSwitching(true)
    setTimeout(() => {
      setView(mode)
      setSwitching(false)
    }, 250)
  }

  // 按年分组
  const groups: [string, Post[]][] = useMemo(() => {
    const visible = filtered.slice(0, visibleCount)
    const result: [string, Post[]][] = []
    for (const p of visible) {
      const year = (p.date || '').slice(0, 4) || '未知'
      const last = result[result.length - 1]
      if (last && last[0] === year) last[1].push(p)
      else result.push([year, [p]])
    }
    return result
  }, [filtered, visibleCount])

  const hasMore = visibleCount < filtered.length

  return (
    <main className='mx-auto max-w-4xl px-6 pb-24'>
      <Head>
        <title>{`全部文章 | ${BLOG.TITLE}`}</title>
      </Head>

      {/* 页头 */}
      <header className='animate-fade-up pt-24 pb-10 text-center'>
        <Link
          href='/'
          className='ink-underline mb-10 block text-xs tracking-[0.25em] text-ink-faint transition-colors duration-300 hover:text-cinnabar'>
          ⟵ 返回首页
        </Link>
        {/* 站点印章 logo · 墨迹晕染入场 */}
        <img
          src='/logo.png'
          alt='冷苏手记印章'
          className='mx-auto block h-16 w-16 animate-ink-spread rounded-xl object-cover shadow-[0_6px_24px_rgba(168,68,46,0.16)]'
        />
        <h1 className='mt-4 pl-[0.35em] text-4xl font-semibold tracking-[0.35em] text-ink'>
          全部文章
        </h1>
        <p className='mt-5 text-sm tracking-[0.2em] text-ink-faint'>
          共 {filtered.length} 篇
          {(activeCategory || activeTag || query) && ` · 已筛选（总 ${posts.length} 篇）`}
        </p>
        <div className='mt-8 flex items-center justify-center gap-4'>
          <span className='h-px w-16 bg-line' />
          <span className='text-xs text-ink-faint'>✦</span>
          <span className='h-px w-16 bg-line' />
        </div>
      </header>

      {/* ============ 搜索栏 ============ */}
      <Reveal variant='fade'>
        <div className='relative mx-auto max-w-md'>
          <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint'>
            <svg width='15' height='15' viewBox='0 0 16 16' fill='none'>
              <circle cx='7' cy='7' r='5.5' stroke='currentColor' strokeWidth='1.4' />
              <path d='M11 11l3.5 3.5' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
            </svg>
          </span>
          <input
            type='text'
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='搜索标题、标签、分类…'
            className='w-full rounded-full border border-line bg-surface py-3 pl-11 pr-10 text-sm tracking-[0.08em] text-ink placeholder:text-ink-faint/60 outline-none transition-all duration-400 focus:border-cinnabar-soft/50 focus:shadow-[0_4px_20px_rgba(168,68,46,0.08)]'
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className='absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-cinnabar'
              aria-label='清除搜索'>
              ✕
            </button>
          )}
        </div>
      </Reveal>

      {/* ============ 分类 + 标签筛选 ============ */}
      <Reveal delay={80}>
        <div className='mt-8 space-y-4'>
          {/* 分类 chips */}
          <div className='flex flex-wrap items-center justify-center gap-2.5'>
            <FilterChip
              label='全部'
              active={!activeCategory}
              onClick={() => setActiveCategory(null)}
            />
            {categories.map(([name, color]) => (
              <FilterChip
                key={name}
                label={name}
                color={color}
                active={activeCategory === name}
                onClick={() => setActiveCategory(activeCategory === name ? null : name)}
              />
            ))}
          </div>
          {/* 标签云 */}
          <div className='flex flex-wrap items-center justify-center gap-2'>
            {tags.map(([name, color]) => (
              <button
                key={name}
                onClick={() => setActiveTag(activeTag === name ? null : name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] tracking-[0.12em] transition-all duration-350 ${
                  activeTag === name
                    ? `${notionColorClass(color, 0)} ${notionColorClass(color, 1)} ${notionColorClass(color, 2)} border shadow-sm`
                    : 'border border-transparent text-ink-faint hover:border-line hover:text-ink-soft'
                }`}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${notionColorClass(color, 0)} bg-current opacity-60`}
                />
                {name}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============ 视图切换 ============ */}
      <Reveal delay={120}>
        <div className='mt-10 flex items-center justify-center gap-1'>
          <div className='flex rounded-full border border-line bg-surface p-1'>
            <ViewToggle
              active={view === 'vertical'}
              onClick={() => switchView('vertical')}
              label='纵向时间线'>
              <svg width='13' height='13' viewBox='0 0 16 16' fill='none'>
                <path d='M4 2v12M4 4h9M4 8h7M4 12h9' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
              </svg>
            </ViewToggle>
            <ViewToggle
              active={view === 'horizontal'}
              onClick={() => switchView('horizontal')}
              label='横向时间线'>
              <svg width='13' height='13' viewBox='0 0 16 16' fill='none'>
                <path d='M2 12h12M4 12V5M8 12V7M12 12V3' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
              </svg>
            </ViewToggle>
          </div>
        </div>
      </Reveal>

      {/* ============ 内容区（切换动画） ============ */}
      <div
        className={`mt-12 transition-all duration-250 ${
          switching ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
        }`}>
        {filtered.length === 0 ? (
          <div className='py-24 text-center'>
            <p className='text-3xl text-ink-faint/40'>❦</p>
            <p className='mt-5 text-sm tracking-[0.2em] text-ink-faint'>
              未寻得相关文字，换个词试试
            </p>
          </div>
        ) : view === 'vertical' ? (
          /* ---- 竖向时间线 ---- */
          <div className='relative pl-10'>
            <div className='timeline-line' style={{ left: '7px' }} />
            {groups.map(([year, yearPosts]) => (
              <section key={year} className='mb-14'>
                <Reveal variant='blur'>
                  <div className='relative mb-6 flex items-center gap-4'>
                    <span className='absolute -left-10 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-cinnabar bg-paper shadow-[0_0_0_4px_rgba(168,68,46,0.1)]' />
                    <h2 className='text-2xl font-semibold tracking-wider text-ink/85 tabular-nums'>
                      {year}
                    </h2>
                    <span className='h-px flex-1 bg-line' />
                    <span className='text-xs tracking-[0.2em] text-ink-faint'>
                      {yearPosts.length} 篇
                    </span>
                  </div>
                </Reveal>

                <ul className='space-y-1'>
                  {yearPosts.map((post, i) => (
                    <Reveal key={post.id} variant={i % 2 === 0 ? 'left' : 'right'} delay={Math.min(i * 60, 300)}>
                      <li className='group relative'>
                        <span className='timeline-dot' style={{ left: '-37px' }} />
                        <Link
                          href={`/post/${post.slug}`}
                          className='card-lift flex items-center gap-4 rounded-lg px-4 py-4 transition-all duration-350 hover:bg-surface hover:shadow-[0_4px_16px_rgba(46,43,36,0.05)]'>
                          {/* 封面缩略图 + 角标图标 */}
                          <div className='img-skeleton relative h-14 w-20 shrink-0 overflow-hidden rounded-md'>
                            {post.pageCover && (
                              <img
                                src={post.pageCover}
                                alt=''
                                loading='lazy'
                                className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                              />
                            )}
                            <span className='absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-paper/95 text-[10px] shadow-sm'>
                              {post.pageIcon || '📄'}
                            </span>
                          </div>

                          {/* 标题 + 标签 */}
                          <div className='min-w-0 flex-1'>
                            <h3 className='truncate text-lg font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                              {post.title}
                            </h3>
                            <div className='mt-1 flex items-center gap-2.5 text-xs text-ink-faint'>
                              {post.category && (
                                <span
                                  className={`rounded-full border px-2 py-px text-[10px] tracking-[0.1em] ${notionColorClass(post.categoryColor, 0)} ${notionColorClass(post.categoryColor, 1)} ${notionColorClass(post.categoryColor, 2)}`}>
                                  {post.category}
                                </span>
                              )}
                              {post.tags?.slice(0, 2).map(t => (
                                <span key={t} className='tracking-[0.1em]'>
                                  {t}
                                </span>
                              ))}
                              {post.readMinutes && (
                                <span className='tabular-nums'>约{post.readMinutes}min</span>
                              )}
                            </div>
                          </div>

                          {/* 日期 + 箭头 */}
                          <div className='flex shrink-0 items-center gap-3'>
                            {post.date && (
                              <span className='text-xs tracking-[0.12em] text-ink-faint tabular-nums'>
                                {post.date.slice(5)}
                              </span>
                            )}
                            <span className='text-ink-faint opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cinnabar group-hover:opacity-100'>
                              ⟶
                            </span>
                          </div>
                        </Link>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          /* ---- 横向时间线 ---- */
          <HorizontalTimeline groups={groups} />
        )}

        {/* 加载更多指示 */}
        <div ref={loadMoreRef} className='flex justify-center py-8'>
          {hasMore ? (
            <div className='flex items-center gap-3 text-xs tracking-[0.25em] text-ink-faint'>
              <span className='h-1 w-1 animate-breathe rounded-full bg-cinnabar-soft' />
              正在加载更多
              <span className='h-1 w-1 animate-breathe rounded-full bg-cinnabar-soft' style={{ animationDelay: '0.5s' }} />
            </div>
          ) : filtered.length > PAGE_SIZE ? (
            <p className='text-xs tracking-[0.25em] text-ink-faint/60'>⁂ 已至卷末</p>
          ) : null}
        </div>
      </div>

      {/* 页脚 */}
      <Footer />
    </main>
  )
}

/**
 * 筛选 Chip
 */
function FilterChip({
  label,
  color,
  active,
  onClick
}: {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs tracking-[0.15em] transition-all duration-350 ${
        active
          ? color
            ? `${notionColorClass(color, 0)} ${notionColorClass(color, 1)} ${notionColorClass(color, 2)} shadow-sm`
            : 'border-cinnabar bg-cinnabar text-paper shadow-sm'
          : 'border-line bg-surface text-ink-soft hover:border-cinnabar-soft/40 hover:text-ink'
      }`}>
      {label}
    </button>
  )
}

/**
 * 视图切换按钮
 */
function ViewToggle({
  active,
  onClick,
  label,
  children
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-[0.15em] transition-all duration-350 ${
        active
          ? 'bg-cinnabar text-paper shadow-[0_2px_10px_rgba(168,68,46,0.25)]'
          : 'text-ink-faint hover:text-ink-soft'
      }`}>
      {children}
      <span className='hidden sm:inline'>{label}</span>
    </button>
  )
}

/**
 * 横向时间线 · 水平滚动 + 年份节点 + 卡片悬浮
 */
function HorizontalTimeline({ groups }: { groups: [string, Post[]][] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [groups])

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' })
  }

  return (
    <div className='relative'>
      {/* 左右箭头 */}
      {canLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className='absolute -left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-soft shadow-md backdrop-blur-sm transition-all hover:border-cinnabar-soft/40 hover:text-cinnabar'
          aria-label='向左滚动'>
          ⟵
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scrollBy(1)}
          className='absolute -right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-soft shadow-md backdrop-blur-sm transition-all hover:border-cinnabar-soft/40 hover:text-cinnabar'
          aria-label='向右滚动'>
          ⟶
        </button>
      )}

      {/* 横向滚动区 */}
      <div
        ref={scrollRef}
        className='flex gap-0 overflow-x-auto pb-6 pt-4 scrollbar-thin'
        style={{ scrollbarWidth: 'thin' }}>
        {groups.map(([year, yearPosts]) => (
          <div key={year} className='relative flex shrink-0 flex-col'>
            {/* 年份节点 */}
            <div className='sticky left-0 z-[5] mb-6 flex items-center gap-3 pl-2'>
              <span className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-cinnabar bg-paper text-[10px] font-semibold text-cinnabar shadow-[0_0_0_4px_rgba(168,68,46,0.08)]'>
                {year.slice(2)}
              </span>
              <span className='text-sm font-semibold tracking-wider text-ink/70 tabular-nums'>
                {year}
              </span>
              <span className='text-[10px] tracking-[0.15em] text-ink-faint'>
                {yearPosts.length}篇
              </span>
            </div>

            {/* 卡片行 */}
            <div className='relative flex gap-4 pl-2 pr-8'>
              {/* 横向轴线 · 贯穿圆点中心 */}
              <div className='absolute left-0 right-0 top-[14px] h-px bg-gradient-to-r from-line via-line to-transparent' />
              {yearPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className='group relative w-56 shrink-0 pt-9'>
                  {/* 节点圆点 · 坐在轴线上（纸底色盖住轴线形成节点感） */}
                  <span className='absolute left-4 top-[9px] h-2.5 w-2.5 rounded-full border-2 border-cinnabar-soft bg-paper transition-all duration-350 group-hover:scale-125 group-hover:bg-cinnabar' />
                  {/* 连接竖线 · 圆点底部到卡片顶部 */}
                  <span className='absolute left-[20.5px] top-[19px] h-[17px] w-px bg-line' />

                  <div className='overflow-hidden rounded-xl border border-line bg-surface shadow-[0_2px_12px_rgba(46,43,36,0.04)] transition-all duration-400 group-hover:-translate-y-1.5 group-hover:border-cinnabar-soft/30 group-hover:shadow-[0_12px_32px_rgba(46,43,36,0.1)]'>
                    {/* 封面 */}
                    <div className='img-skeleton relative h-24 w-full overflow-hidden'>
                      {post.pageCover && (
                        <img
                          src={post.pageCover}
                          alt=''
                          loading='lazy'
                          className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-108'
                        />
                      )}
                      <span className='absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-paper/90 text-xs shadow-sm backdrop-blur-sm'>
                        {post.pageIcon || '📄'}
                      </span>
                    </div>
                    <div className='p-3.5'>
                      <h3 className='line-clamp-2 text-sm font-medium leading-relaxed text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                        {post.title}
                      </h3>
                      <div className='mt-2.5 flex items-center justify-between text-[10px] text-ink-faint'>
                        <span className='tabular-nums'>{post.date?.slice(5)}</span>
                        {post.category && (
                          <span
                            className={`rounded-full border px-1.5 py-px ${notionColorClass(post.categoryColor, 0)} ${notionColorClass(post.categoryColor, 2)}`}>
                            {post.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部滚动提示 */}
      <p className='mt-2 text-center text-[10px] tracking-[0.3em] text-ink-faint/50'>
        ⟵ 横向滑动浏览 ⟶
      </p>
    </div>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts()
  return {
    props: { posts },
    revalidate: Number(BLOG.REVALIDATE_SECOND) || 60
  }
}
