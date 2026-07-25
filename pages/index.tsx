import BLOG from '@/blog.config'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { getPosts } from '@/lib/notion-server'
import { notionColorClass, type Post } from '@/lib/notion'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  posts: Post[]
}

/**
 * 首页 · 视差 Hero + 站点统计 + 精选文章 + 诗意装饰
 */
export default function Home({ posts }: Props) {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const heroImgRef = useRef<HTMLImageElement>(null)
  const hero = posts[0]
  const featured = posts.slice(0, 3)
  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))]

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

  // 鼠标视差（仅 Hero 区域内生效）
  useEffect(() => {
    let raf = 0
    const onMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setMouse({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2
        })
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // 图片可能在 hydration 前已从缓存加载完成
  useEffect(() => {
    const img = heroImgRef.current
    if (img?.complete && img.naturalWidth > 0) setCoverLoaded(true)
  }, [])

  // Hero 内容随滚动渐隐
  const heroOpacity = Math.max(0, 1 - scrollY / 500)
  const heroTranslate = scrollY * 0.25
  const parallaxOffset = scrollY * 0.4

  const titleChars = BLOG.TITLE.split('')

  return (
    <main>
      <Head>
        <title>{BLOG.TITLE}</title>
      </Head>

      {/* ============ 全屏视差 Hero ============ */}
      <section className='relative h-screen overflow-hidden bg-[#16140f]'>
        {/* 背景封面 · 视差 + 鼠标微动（包裹层）+ Ken Burns（图片层） */}
        <div
          className='absolute inset-[-4%]'
          style={{
            transform: `translateY(${parallaxOffset * 0.35}px) translate(${mouse.x * -8}px, ${mouse.y * -5}px)`,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
          }}>
          {hero?.pageCover && (
            <img
              ref={heroImgRef}
              src={hero.pageCover}
              alt=''
              onLoad={() => setCoverLoaded(true)}
              className={`animate-kenburns h-full w-full object-cover transition-opacity duration-1000 ${
                coverLoaded ? 'opacity-80' : 'opacity-0'
              }`}
            />
          )}
        </div>
        {/* 渐变遮罩 */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#16140f]/90' />

        {/* 悬浮光粒子 · 随鼠标漂移 */}
        <div className='pointer-events-none absolute inset-0 z-[5]' aria-hidden='true'>
          {[
            { left: '12%', top: '28%', size: 4, delay: '0s', dur: '5s', mx: 18, my: 12 },
            { left: '78%', top: '22%', size: 3, delay: '1.2s', dur: '6s', mx: -14, my: 10 },
            { left: '65%', top: '62%', size: 5, delay: '0.6s', dur: '4.5s', mx: 12, my: -16 },
            { left: '25%', top: '70%', size: 3, delay: '2s', dur: '5.5s', mx: -10, my: -8 },
            { left: '88%', top: '48%', size: 4, delay: '1.6s', dur: '6.5s', mx: 15, my: 14 },
            { left: '42%', top: '18%', size: 3, delay: '0.9s', dur: '5.2s', mx: -12, my: 9 }
          ].map((p, i) => (
            <span
              key={i}
              className='absolute rounded-full bg-paper/40'
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
                translate: `${mouse.x * p.mx}px ${mouse.y * p.my}px`,
                transition: 'translate 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: '0 0 6px 1px rgba(246, 242, 233, 0.25)'
              }}
            />
          ))}
        </div>

        {/* 中心内容 · 随滚动渐隐上移 + 鼠标微视差 */}
        <div
          className='relative z-10 flex h-full flex-col items-center justify-center px-6 text-center'
          style={{
            opacity: heroOpacity,
            transform: `translateY(-${heroTranslate}px) translate(${mouse.x * 5}px, ${mouse.y * 3}px)`,
            transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
          }}>
          <div
            className='animate-fade-up mb-7 text-2xl text-paper/80'
            style={{ animationDelay: '0.5s', animationDuration: '1.4s' }}>
            ❦
          </div>

          {/* 标题逐字墨迹晕染 */}
          <h1 className='hero-title pl-[0.3em] text-5xl font-semibold tracking-[0.3em] text-paper md:text-7xl'>
            {titleChars.map((c, i) => (
              <span
                key={i}
                className='inline-block animate-ink-char'
                style={{ animationDelay: `${0.65 + i * 0.12}s`, animationDuration: '1.2s' }}>
                {c}
              </span>
            ))}
          </h1>

          <p
            className='animate-fade-up mt-7 pl-[0.28em] text-sm tracking-[0.28em] text-paper/70'
            style={{ animationDelay: '1.1s', animationDuration: '1.4s' }}>
            {BLOG.DESCRIPTION}
          </p>
          <div
            className='animate-fade-up mt-10 flex items-center gap-4'
            style={{ animationDelay: '1.25s', animationDuration: '1.4s' }}>
            <span className='h-px w-16 bg-paper/40' />
            <span className='text-xs text-paper/60'>✦</span>
            <span className='h-px w-16 bg-paper/40' />
          </div>

          {/* 站点统计 */}
          <div
            className='animate-fade-up mt-12 flex items-center gap-6 text-paper/60'
            style={{ animationDelay: '1.45s', animationDuration: '1.4s' }}>
            <StatNumber value={posts.length} label='篇手记' />
            <span className='h-4 w-px bg-paper/25' />
            <StatNumber value={categories.length} label='个分类' />
            <span className='h-4 w-px bg-paper/25' />
            <span className='text-xs tracking-[0.22em]'>笔耕不辍</span>
          </div>
        </div>

        {/* 最新文章入口 */}
        {hero && (
          <Link
            href={`/post/${hero.slug}`}
            className='group absolute bottom-24 left-1/2 z-10 w-[88%] max-w-xl -translate-x-1/2 text-center'
            style={{ opacity: heroOpacity }}>
            <p className='text-[11px] tracking-[0.3em] text-paper/55'>
              最新文章 · LATEST
            </p>
            <p className='hero-title mt-2.5 text-lg font-medium leading-relaxed text-paper transition-colors duration-300 group-hover:text-[#e8b4a0] md:text-xl'>
              {hero.pageIcon && <span className='mr-2'>{hero.pageIcon}</span>}
              {hero.title}
            </p>
          </Link>
        )}

        {/* 滚动指示器 */}
        <div
          className='absolute bottom-7 left-1/2 z-10 -translate-x-1/2'
          style={{ opacity: heroOpacity }}>
          <div className='flex h-10 w-6 justify-center rounded-full border border-paper/40 pt-2'>
            <div className='animate-scroll-dot h-1.5 w-1.5 rounded-full bg-paper/80' />
          </div>
        </div>
      </section>

      {/* ============ 精选文章 ============ */}
      <section className='mx-auto max-w-5xl px-6 py-24'>
        <Reveal>
          <div className='mb-14 flex items-center justify-center gap-5'>
            <span className='h-px w-14 bg-line' />
            <h2 className='pl-[0.3em] text-2xl font-semibold tracking-[0.3em] text-ink'>
              近作
            </h2>
            <span className='h-px w-14 bg-line' />
          </div>
        </Reveal>

        <div className='grid gap-10 md:grid-cols-2'>
          {featured.map((post, i) => (
            <Reveal
              key={post.id}
              delay={i * 120}
              className={i === 0 ? 'md:col-span-2' : ''}>
              <PostCard post={post} large={i === 0} />
            </Reveal>
          ))}
        </div>

        {/* 诗意装饰分隔 */}
        <Reveal delay={100}>
          <div className='relative mt-24 flex items-center justify-center py-10'>
            {/* 飘落花瓣微动效（视差辅助动画营造景深） */}
            <span className='absolute left-[18%] top-2 h-2 w-2 animate-parallax-slow rounded-full bg-cinnabar-soft/20' style={{ animationDelay: '0.5s' }} />
            <span className='absolute right-[22%] top-6 h-1.5 w-1.5 animate-parallax-fast rounded-full bg-cinnabar-soft/15' style={{ animationDelay: '1.2s' }} />
            <span className='absolute left-[38%] bottom-4 h-1.5 w-1.5 animate-float rounded-full bg-ink/10' style={{ animationDelay: '2s' }} />

            <div className='flex items-center gap-8'>
              <span className='writing-vertical text-xs leading-loose tracking-[0.35em] text-ink-faint/70'>
                落笔成诗
              </span>
              <div className='flex flex-col items-center gap-3'>
                <span className='h-12 w-px bg-gradient-to-b from-transparent via-line to-transparent' />
                <span className='text-cinnabar/60'>❧</span>
                <span className='h-12 w-px bg-gradient-to-b from-transparent via-line to-transparent' />
              </div>
              <span className='writing-vertical text-xs leading-loose tracking-[0.35em] text-ink-faint/70'>
                阅尽千帆
              </span>
            </div>
          </div>
        </Reveal>

        {/* 全部文章入口 */}
        <Reveal delay={150}>
          <div className='text-center'>
            <Link
              href='/posts'
              className='btn-cinnabar group inline-flex items-center gap-3 border border-ink/25 px-10 py-3.5 text-sm tracking-[0.25em] text-ink transition-all duration-500 hover:border-cinnabar hover:text-paper'>
              阅读全部文章
              <span className='transition-transform duration-500 group-hover:translate-x-1.5'>
                ⟶
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============ 页脚 ============ */}
      <Footer />
    </main>
  )
}

/**
 * 数字滚动动画统计
 */
function StatNumber({ value, label }: { value: number; label: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const start = performance.now()
          const duration = 1200
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setDisplay(Math.round(eased * value))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          io.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return (
    <span ref={ref} className='flex items-baseline gap-1.5'>
      <span className='stat-number text-xl font-semibold text-paper/90'>{display}</span>
      <span className='text-xs tracking-[0.18em]'>{label}</span>
    </span>
  )
}

/**
 * 文章卡片：封面 hover 缩放 + 毛玻璃信息层 + 彩色徽章
 */
function PostCard({ post, large }: { post: Post; large?: boolean }) {
  return (
    <Link href={`/post/${post.slug}`} className='group block'>
      {/* 封面 */}
      <div
        className={`cover-zoom img-skeleton relative overflow-hidden rounded-sm transition-shadow duration-700 group-hover:shadow-[0_16px_48px_rgba(46,43,36,0.15)] ${
          large ? 'aspect-[21/9]' : 'aspect-[16/10]'
        }`}>
        {post.pageCover && (
          <img
            src={post.pageCover}
            alt={post.title}
            loading='lazy'
            className='h-full w-full object-cover'
          />
        )}
        {/* 悬浮暗层 */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100' />

        {/* 分类彩色徽章 */}
        {post.category && (
          <span
            className={`absolute left-4 top-4 border px-3 py-1 text-[11px] tracking-[0.2em] backdrop-blur-sm ${notionColorClass(post.categoryColor, 0)} ${notionColorClass(post.categoryColor, 1)} ${notionColorClass(post.categoryColor, 2)} bg-paper/85`}>
            {post.pageIcon && <span className='mr-1'>{post.pageIcon}</span>}
            {post.category}
          </span>
        )}

        {/* 大卡片底部毛玻璃信息层 */}
        {large && (
          <div className='absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100'>
            <p className='text-sm leading-relaxed text-paper/85 line-clamp-1'>
              {post.summary || post.title}
            </p>
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className='pt-6'>
        <div className='flex items-center gap-3 text-xs tracking-[0.18em] text-ink-faint tabular-nums'>
          {post.date && <span>{post.date}</span>}
          {post.readMinutes && (
            <>
              <span className='h-0.5 w-0.5 rounded-full bg-ink-faint/60' />
              <span>约 {post.readMinutes} 分钟</span>
            </>
          )}
        </div>
        <h3
          className={`ink-underline mt-2.5 inline-block font-medium leading-relaxed text-ink transition-colors duration-300 group-hover:text-cinnabar ${
            large ? 'text-2xl' : 'text-xl'
          }`}>
          {post.title}
        </h3>
        {post.summary && (
          <p className='mt-3 text-sm leading-relaxed text-ink-soft line-clamp-2'>
            {post.summary}
          </p>
        )}
        {/* 标签彩色圆点 */}
        {post.tags && post.tags.length > 0 && (
          <div className='mt-3.5 flex flex-wrap items-center gap-2.5'>
            {post.tags.map(tag => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] tracking-[0.1em] ${notionColorClass(post.tagColors?.[tag], 0)} ${notionColorClass(post.tagColors?.[tag], 1)} ${notionColorClass(post.tagColors?.[tag], 2)}`}>
                <span className='h-1 w-1 rounded-full bg-current opacity-70' />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts()
  return {
    props: { posts },
    revalidate: Number(BLOG.REVALIDATE_SECOND) || 60
  }
}
