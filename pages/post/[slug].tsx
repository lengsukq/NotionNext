import BLOG from '@/blog.config'
import Footer from '@/components/Footer'
import NotionPage from '@/components/NotionPage'
import Toc from '@/components/Toc'
import { getPosts, getPostById } from '@/lib/notion-server'
import { notionColorClass, type Post } from '@/lib/notion'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  post: Post
  prev: { slug: string; title: string; pageCover?: string; pageIcon?: string } | null
  next: { slug: string; title: string; pageCover?: string; pageIcon?: string } | null
}

/**
 * 文章详情页 · 全屏封面视差 + 目录导航 + 作者信息卡
 */
export default function PostPage({ post, prev, next }: Props) {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const coverImgRef = useRef<HTMLImageElement>(null)

  // 视差滚动
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // 图片可能在 hydration 前已从缓存加载完成
  useEffect(() => {
    const img = coverImgRef.current
    if (img?.complete && img.naturalWidth > 0) setCoverLoaded(true)
  }, [])

  if (!post) return null

  const parallaxOffset = Math.min(scrollY * 0.35, 300)

  return (
    <main>
      <Head>
        <title>{`${post.title} | ${BLOG.TITLE}`}</title>
        {post.summary && <meta name='description' content={post.summary} />}
      </Head>

      {/* ============ 全屏封面 Hero · 视差 ============ */}
      <section className='relative flex h-[88vh] min-h-[520px] flex-col overflow-hidden bg-[#16140f]'>
        {/* 背景封面 · 视差（包裹层）+ Ken Burns（图片层） */}
        <div
          className='absolute inset-[-4%]'
          style={{ transform: `translateY(${parallaxOffset}px)` }}>
          {post.pageCover && (
            <img
              ref={coverImgRef}
              src={post.pageCover}
              alt=''
              onLoad={() => setCoverLoaded(true)}
              className={`animate-kenburns h-full w-full object-cover transition-opacity duration-1000 ${
                coverLoaded ? 'opacity-75' : 'opacity-0'
              }`}
            />
          )}
        </div>
        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-[#16140f]/95' />

        {/* 顶部导航 */}
        <nav className='relative z-10 flex items-center justify-between px-5 pt-6 sm:px-8 md:px-12 md:pt-7'>
          <Link
            href='/'
            className='ink-underline text-xs tracking-[0.25em] text-paper/75 transition-colors duration-300 hover:text-paper'>
            ⟵ 首页
          </Link>
          {/* 品牌印章 logo · 悬停微放大 */}
          <Link href='/' aria-label='返回首页' className='transition-transform duration-300 hover:scale-105'>
            <img
              src='/logo.png'
              alt='冷苏手记'
              className='h-9 w-9 rounded-lg object-cover shadow-[0_2px_14px_rgba(0,0,0,0.35)] ring-1 ring-paper/25'
            />
          </Link>
          <Link
            href='/posts'
            className='ink-underline text-xs tracking-[0.25em] text-paper/75 transition-colors duration-300 hover:text-paper'>
            全部文章
          </Link>
        </nav>

        {/* 底部标题区 */}
        <div className='relative z-10 mt-auto px-5 pb-14 sm:px-8 md:px-12 md:pb-16'>
          <div className='mx-auto max-w-3xl'>
            {/* 页面图标 · 浮动动画 */}
            {post.pageIcon && (
              <span
                className='animate-fade-up mb-5 inline-block animate-float text-4xl md:text-5xl'
                style={{ animationDelay: '0.2s' }}>
                {post.pageIcon}
              </span>
            )}

            {/* 分类彩色徽章 */}
            {post.category && (
              <span
                className={`animate-fade-up mr-2 inline-block rounded-full border px-3.5 py-1 text-[11px] tracking-[0.25em] backdrop-blur-sm ${notionColorClass(post.categoryColor, 0)} ${notionColorClass(post.categoryColor, 1)} ${notionColorClass(post.categoryColor, 2)} bg-paper/10`}
                style={{ animationDelay: '0.3s' }}>
                {post.category}
              </span>
            )}
            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <span className='animate-fade-up inline-flex flex-wrap gap-2 align-middle' style={{ animationDelay: '0.35s' }}>
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] tracking-[0.15em] backdrop-blur-sm ${notionColorClass(post.tagColors?.[tag], 0)} ${notionColorClass(post.tagColors?.[tag], 1)} ${notionColorClass(post.tagColors?.[tag], 2)} bg-paper/10`}>
                    <span className='h-1 w-1 rounded-full bg-current opacity-70' />
                    {tag}
                  </span>
                ))}
              </span>
            )}

            <h1
              className='hero-title animate-fade-up mt-5 text-2xl font-semibold leading-snug text-paper sm:text-3xl md:text-5xl md:leading-tight'
              style={{ animationDelay: '0.45s', animationDuration: '1.2s' }}>
              {post.title}
            </h1>

            {/* 元信息行 */}
            <div
              className='animate-fade-up mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs tracking-[0.18em] text-paper/65 sm:text-sm'
              style={{ animationDelay: '0.65s' }}>
              {post.date && (
                <span className='flex items-center gap-1.5 tabular-nums'>
                  <svg width='13' height='13' viewBox='0 0 16 16' fill='none' className='opacity-70'>
                    <rect x='2' y='3' width='12' height='11' rx='2' stroke='currentColor' strokeWidth='1.2' />
                    <path d='M2 6.5h12M5.5 1.5v3M10.5 1.5v3' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' />
                  </svg>
                  {post.date}
                </span>
              )}
              {post.readMinutes && (
                <span className='flex items-center gap-1.5'>
                  <svg width='13' height='13' viewBox='0 0 16 16' fill='none' className='opacity-70'>
                    <circle cx='8' cy='8' r='6.5' stroke='currentColor' strokeWidth='1.2' />
                    <path d='M8 4.5V8l2.5 1.5' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' />
                  </svg>
                  约 {post.readMinutes} 分钟
                </span>
              )}
              {post.wordCount && (
                <span className='tabular-nums'>{post.wordCount.toLocaleString()} 字</span>
              )}
              {post.lastEdited && (
                <span className='hidden text-paper/45 sm:inline'>
                  最后编辑 {post.lastEdited}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 滚动指示 */}
        <div className='absolute bottom-5 left-1/2 z-10 -translate-x-1/2'>
          <div className='flex h-9 w-5 justify-center rounded-full border border-paper/40 pt-1.5'>
            <div className='animate-scroll-dot h-1.5 w-1.5 rounded-full bg-paper/80' />
          </div>
        </div>
      </section>

      {/* ============ 目录 ============ */}
      <Toc blockMap={post.blockMap} />

      {/* ============ 正文 ============ */}
      <article className='mx-auto max-w-3xl px-5 pb-10 pt-12 sm:px-6 md:pt-14'>
        <NotionPage blockMap={post.blockMap} />
      </article>

      {/* ============ 文末信息卡 ============ */}
      <section className='mx-auto max-w-3xl px-5 pb-6 sm:px-6'>
        <div className='relative overflow-hidden rounded-2xl border border-line bg-surface p-7 shadow-[0_8px_32px_rgba(46,43,36,0.06)] sm:p-9'>
          {/* 装饰纹理 */}
          <div className='pointer-events-none absolute -right-6 -top-6 text-[120px] leading-none text-line/30 select-none' aria-hidden='true'>
            ❧
          </div>

          <div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
            {/* 印章 */}
            <div className='flex h-14 w-14 shrink-0 -rotate-6 items-center justify-center rounded-lg border-2 border-cinnabar-soft/80 text-2xl font-semibold text-cinnabar shadow-[0_2px_12px_rgba(168,68,46,0.15)]'>
              {BLOG.AUTHOR.slice(-1)}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-lg font-semibold tracking-[0.08em] text-ink'>{BLOG.AUTHOR}</p>
              <p className='mt-1 text-xs leading-relaxed tracking-[0.1em] text-ink-soft'>
                {BLOG.BIO}
              </p>
              {BLOG.GITHUB && (
                <a
                  href={BLOG.GITHUB}
                  target='_blank'
                  rel='noreferrer'
                  className='ink-underline mt-2 inline-block text-xs tracking-[0.18em] text-cinnabar transition-colors hover:text-cinnabar-soft'>
                  GitHub ⟶
                </a>
              )}
            </div>
            {/* 文章数据 */}
            <div className='flex shrink-0 gap-6 border-t border-line/70 pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0'>
              {post.wordCount && (
                <div className='text-center'>
                  <p className='text-lg font-semibold text-ink tabular-nums'>
                    {(post.wordCount / 1000).toFixed(1)}k
                  </p>
                  <p className='mt-0.5 text-[10px] tracking-[0.2em] text-ink-faint'>字数</p>
                </div>
              )}
              {post.readMinutes && (
                <div className='text-center'>
                  <p className='text-lg font-semibold text-ink tabular-nums'>{post.readMinutes}</p>
                  <p className='mt-0.5 text-[10px] tracking-[0.2em] text-ink-faint'>分钟</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 上一篇 / 下一篇 · 带封面 ============ */}
      <nav className='mx-auto max-w-3xl px-5 pb-16 sm:px-6'>
        <div className='grid gap-5 border-t border-line/70 pt-10 sm:grid-cols-2'>
          {prev ? (
            <Link href={`/post/${prev.slug}`} className='group'>
              <p className='text-[11px] tracking-[0.25em] text-ink-faint'>⟵ 上一篇</p>
              <div className='mt-3 flex items-center gap-3.5'>
                {prev.pageCover && (
                  <div className='img-skeleton h-14 w-20 shrink-0 overflow-hidden rounded-md'>
                    <img
                      src={prev.pageCover}
                      alt=''
                      loading='lazy'
                      className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                    />
                  </div>
                )}
                <div className='min-w-0'>
                  <p className='line-clamp-2 font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                    {prev.pageIcon && <span className='mr-1.5'>{prev.pageIcon}</span>}
                    {prev.title}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <span className='hidden sm:block' />
          )}
          {next && (
            <Link href={`/post/${next.slug}`} className='group sm:text-right'>
              <p className='text-[11px] tracking-[0.25em] text-ink-faint'>下一篇 ⟶</p>
              <div className='mt-3 flex items-center justify-end gap-3.5'>
                <div className='min-w-0'>
                  <p className='line-clamp-2 font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                    {next.pageIcon && <span className='mr-1.5'>{next.pageIcon}</span>}
                    {next.title}
                  </p>
                </div>
                {next.pageCover && (
                  <div className='img-skeleton h-14 w-20 shrink-0 overflow-hidden rounded-md'>
                    <img
                      src={next.pageCover}
                      alt=''
                      loading='lazy'
                      className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                    />
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* 页脚 */}
      <Footer />
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts()
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const posts = await getPosts()
  const idx = posts.findIndex(p => p.slug === slug)
  if (idx === -1) return { notFound: true }

  const post = await getPostById(posts[idx].id)
  if (!post) return { notFound: true }

  // posts 按日期倒序：idx-1 为更新（上一篇），idx+1 为更旧（下一篇）
  const pick = (p?: Post) =>
    p ? { slug: p.slug, title: p.title, pageCover: p.pageCover, pageIcon: p.pageIcon } : null

  return {
    props: {
      post,
      prev: pick(posts[idx - 1]),
      next: pick(posts[idx + 1])
    },
    revalidate: Number(BLOG.REVALIDATE_SECOND) || 60
  }
}
