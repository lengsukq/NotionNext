import BLOG from '@/blog.config'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { getPosts } from '@/lib/notion-server'
import type { Post } from '@/lib/notion'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  posts: Post[]
}

/**
 * 首页 · 全屏封面 Hero + 精选文章 + 全部文章入口
 */
export default function Home({ posts }: Props) {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const heroImgRef = useRef<HTMLImageElement>(null)
  const hero = posts[0]
  const featured = posts.slice(0, 3)

  // 图片可能在 hydration 前已从缓存加载完成，onLoad 不再触发，需主动检查
  useEffect(() => {
    const img = heroImgRef.current
    if (img?.complete && img.naturalWidth > 0) setCoverLoaded(true)
  }, [])

  return (
    <main>
      <Head>
        <title>{BLOG.TITLE}</title>
      </Head>

      {/* ============ 全屏 Hero ============ */}
      <section className='relative h-screen overflow-hidden bg-[#16140f]'>
        {/* 背景封面 · Ken Burns 缓慢推移 */}
        {hero?.pageCover && (
          <img
            ref={heroImgRef}
            src={hero.pageCover}
            alt=''
            onLoad={() => setCoverLoaded(true)}
            className={`animate-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              coverLoaded ? 'opacity-80' : 'opacity-0'
            }`}
          />
        )}
        {/* 渐变遮罩 */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#16140f]/90' />

        {/* 中心内容 */}
        <div className='relative z-10 flex h-full flex-col items-center justify-center px-6 text-center'>
          <div
            className='animate-fade-up mb-7 text-2xl text-paper/80'
            style={{ animationDelay: '0.5s', animationDuration: '1.4s' }}>
            ❦
          </div>
          <h1
            className='hero-title animate-fade-up pl-[0.3em] text-5xl font-semibold tracking-[0.3em] text-paper md:text-7xl'
            style={{ animationDelay: '0.65s', animationDuration: '1.4s' }}>
            {BLOG.TITLE}
          </h1>
          <p
            className='animate-fade-up mt-7 pl-[0.28em] text-sm tracking-[0.28em] text-paper/70'
            style={{ animationDelay: '0.85s', animationDuration: '1.4s' }}>
            {BLOG.DESCRIPTION}
          </p>
          <div
            className='animate-fade-up mt-10 flex items-center gap-4'
            style={{ animationDelay: '1s', animationDuration: '1.4s' }}>
            <span className='h-px w-16 bg-paper/40' />
            <span className='text-xs text-paper/60'>✦</span>
            <span className='h-px w-16 bg-paper/40' />
          </div>
        </div>

        {/* 最新文章入口 */}
        {hero && (
          <Link
            href={`/post/${hero.slug}`}
            className='group absolute bottom-24 left-1/2 z-10 w-[88%] max-w-xl -translate-x-1/2 text-center'>
            <p className='text-[11px] tracking-[0.3em] text-paper/55'>
              最新文章 · LATEST
            </p>
            <p className='hero-title mt-2.5 text-lg font-medium leading-relaxed text-paper transition-colors duration-300 group-hover:text-[#e8b4a0] md:text-xl'>
              {hero.title}
            </p>
          </Link>
        )}

        {/* 滚动指示器 */}
        <div className='absolute bottom-7 left-1/2 z-10 -translate-x-1/2'>
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

        {/* 全部文章入口 */}
        <Reveal delay={150}>
          <div className='mt-20 text-center'>
            <Link
              href='/posts'
              className='group inline-flex items-center gap-3 border border-ink/25 px-10 py-3.5 text-sm tracking-[0.25em] text-ink transition-all duration-500 hover:border-cinnabar hover:bg-cinnabar hover:text-paper'>
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
 * 文章卡片：封面 hover 缩放 + 信息层
 */
function PostCard({ post, large }: { post: Post; large?: boolean }) {
  return (
    <Link href={`/post/${post.slug}`} className='group block'>
      {/* 封面 */}
      <div
        className={`cover-zoom relative overflow-hidden rounded-sm bg-line/40 ${
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
        <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100' />
        {post.category && (
          <span className='absolute left-4 top-4 bg-paper/90 px-3 py-1 text-[11px] tracking-[0.2em] text-cinnabar backdrop-blur-sm'>
            {post.icon && <span className='mr-1'>{post.icon}</span>}
            {post.category}
          </span>
        )}
      </div>

      {/* 信息 */}
      <div className='pt-6'>
        {post.date && (
          <p className='text-xs tracking-[0.18em] text-ink-faint tabular-nums'>
            {post.date}
          </p>
        )}
        <h3
          className={`mt-2.5 font-medium leading-relaxed text-ink transition-colors duration-300 group-hover:text-cinnabar ${
            large ? 'text-2xl' : 'text-xl'
          }`}>
          {post.title}
        </h3>
        {post.summary && (
          <p
            className={`mt-3 text-sm leading-relaxed text-ink-soft ${
              large ? 'line-clamp-2' : 'line-clamp-2'
            }`}>
            {post.summary}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <p className='mt-3 text-xs tracking-[0.14em] text-ink-faint'>
            {post.tags.join(' · ')}
          </p>
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
