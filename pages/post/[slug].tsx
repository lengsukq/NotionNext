import BLOG from '@/blog.config'
import Footer from '@/components/Footer'
import NotionPage from '@/components/NotionPage'
import { getPosts, getPostById } from '@/lib/notion-server'
import type { Post } from '@/lib/notion'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  post: Post
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

/**
 * 文章详情页 · 全屏封面沉浸式阅读
 */
export default function PostPage({ post, prev, next }: Props) {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const coverImgRef = useRef<HTMLImageElement>(null)

  // 图片可能在 hydration 前已从缓存加载完成，onLoad 不再触发，需主动检查
  useEffect(() => {
    const img = coverImgRef.current
    if (img?.complete && img.naturalWidth > 0) setCoverLoaded(true)
  }, [])

  if (!post) return null

  return (
    <main>
      <Head>
        <title>{`${post.title} | ${BLOG.TITLE}`}</title>
        {post.summary && <meta name='description' content={post.summary} />}
      </Head>

      {/* ============ 全屏封面 Hero ============ */}
      <section className='relative flex h-[84vh] flex-col overflow-hidden bg-[#16140f]'>
        {/* 背景封面 · Ken Burns */}
        {post.pageCover && (
          <img
            ref={coverImgRef}
            src={post.pageCover}
            alt=''
            onLoad={() => setCoverLoaded(true)}
            className={`animate-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              coverLoaded ? 'opacity-75' : 'opacity-0'
            }`}
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-[#16140f]/95' />

        {/* 顶部导航 */}
        <nav className='relative z-10 flex items-center justify-between px-6 pt-7 md:px-12'>
          <Link
            href='/'
            className='text-xs tracking-[0.25em] text-paper/75 transition-colors duration-300 hover:text-paper'>
            ⟵ 首页
          </Link>
          <Link
            href='/posts'
            className='text-xs tracking-[0.25em] text-paper/75 transition-colors duration-300 hover:text-paper'>
            全部文章
          </Link>
        </nav>

        {/* 底部标题区 */}
        <div className='relative z-10 mt-auto px-6 pb-16 md:px-12'>
          <div className='mx-auto max-w-3xl'>
            {post.category && (
              <span className='animate-fade-up inline-block border border-paper/40 px-3.5 py-1 text-[11px] tracking-[0.25em] text-paper/85 backdrop-blur-sm' style={{ animationDelay: '0.3s' }}>
                {post.category}
              </span>
            )}
            <h1
              className='hero-title animate-fade-up mt-5 text-3xl font-semibold leading-snug text-paper md:text-5xl md:leading-tight'
              style={{ animationDelay: '0.45s', animationDuration: '1.2s' }}>
              {post.title}
            </h1>
            {post.date && (
              <p
                className='animate-fade-up mt-5 text-sm tracking-[0.22em] text-paper/65 tabular-nums'
                style={{ animationDelay: '0.65s' }}>
                {post.date}
                {post.tags && post.tags.length > 0 && (
                  <span className='ml-4 text-paper/50'>
                    {post.tags.join(' · ')}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* 滚动指示 */}
        <div className='absolute bottom-5 left-1/2 z-10 -translate-x-1/2'>
          <div className='flex h-9 w-5 justify-center rounded-full border border-paper/40 pt-1.5'>
            <div className='animate-scroll-dot h-1.5 w-1.5 rounded-full bg-paper/80' />
          </div>
        </div>
      </section>

      {/* ============ 正文 ============ */}
      <article className='mx-auto max-w-3xl px-6 pb-10 pt-14'>
        <NotionPage blockMap={post.blockMap} />
      </article>

      {/* ============ 上一篇 / 下一篇 ============ */}
      <nav className='mx-auto max-w-3xl px-6 pb-16'>
        <div className='grid gap-6 border-t border-line/70 pt-10 sm:grid-cols-2'>
          {prev ? (
            <Link href={`/post/${prev.slug}`} className='group'>
              <p className='text-[11px] tracking-[0.25em] text-ink-faint'>
                ⟵ 上一篇
              </p>
              <p className='mt-2 line-clamp-1 font-medium text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/post/${next.slug}`}
              className='group sm:text-right'>
              <p className='text-[11px] tracking-[0.25em] text-ink-faint'>
                下一篇 ⟶
              </p>
              <p className='mt-2 line-clamp-1 font-medium text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                {next.title}
              </p>
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
    p ? { slug: p.slug, title: p.title } : null

  return {
    props: {
      post,
      prev: pick(posts[idx - 1]),
      next: pick(posts[idx + 1])
    },
    revalidate: Number(BLOG.REVALIDATE_SECOND) || 60
  }
}
