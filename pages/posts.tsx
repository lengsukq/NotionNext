import BLOG from '@/blog.config'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { getPosts } from '@/lib/notion-server'
import type { Post } from '@/lib/notion'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface Props {
  posts: Post[]
}

/**
 * 全部文章页 · 按年归档
 */
export default function AllPosts({ posts }: Props) {
  // 按年分组（posts 已按日期倒序）
  const groups: [string, Post[]][] = []
  for (const p of posts) {
    const year = (p.date || '').slice(0, 4) || '未知'
    const last = groups[groups.length - 1]
    if (last && last[0] === year) last[1].push(p)
    else groups.push([year, [p]])
  }

  return (
    <main className='mx-auto max-w-3xl px-6 pb-24'>
      <Head>
        <title>{`全部文章 | ${BLOG.TITLE}`}</title>
      </Head>

      {/* 页头 */}
      <header className='animate-fade-up pt-24 pb-16 text-center'>
        <Link
          href='/'
          className='mb-10 inline-block text-xs tracking-[0.25em] text-ink-faint transition-colors duration-300 hover:text-cinnabar'>
          ⟵ 返回首页
        </Link>
        <div className='text-xl text-cinnabar'>❧</div>
        <h1 className='mt-4 pl-[0.35em] text-4xl font-semibold tracking-[0.35em] text-ink'>
          全部文章
        </h1>
        <p className='mt-5 text-sm tracking-[0.2em] text-ink-faint'>
          共 {posts.length} 篇 · 按年归档
        </p>
        <div className='mt-8 flex items-center justify-center gap-4'>
          <span className='h-px w-16 bg-line' />
          <span className='text-xs text-ink-faint'>✦</span>
          <span className='h-px w-16 bg-line' />
        </div>
      </header>

      {/* 年度分组 */}
      {groups.map(([year, yearPosts]) => (
        <section key={year} className='mb-16'>
          <Reveal>
            <div className='mb-2 flex items-baseline gap-5'>
              <h2 className='text-3xl font-semibold text-ink/85 tabular-nums tracking-wider'>
                {year}
              </h2>
              <span className='h-px flex-1 self-center bg-line' />
              <span className='text-xs tracking-[0.2em] text-ink-faint'>
                {yearPosts.length} 篇
              </span>
            </div>
          </Reveal>

          <ul>
            {yearPosts.map((post, i) => (
              <Reveal key={post.id} delay={Math.min(i * 60, 300)}>
                <li>
                  <Link
                    href={`/post/${post.slug}`}
                    className='group flex items-center gap-5 border-b border-line/70 py-5 transition-colors duration-300 last:border-0 hover:bg-surface/70'>
                    {/* 封面缩略图 */}
                    <div className='h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-line/40'>
                      {post.pageCover && (
                        <img
                          src={post.pageCover}
                          alt=''
                          loading='lazy'
                          className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                        />
                      )}
                    </div>

                    {/* 标题 + 标签 */}
                    <div className='min-w-0 flex-1'>
                      <h3 className='truncate text-lg font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-cinnabar'>
                        {post.title}
                      </h3>
                      {post.tags && post.tags.length > 0 && (
                        <p className='mt-1 truncate text-xs tracking-[0.14em] text-ink-faint'>
                          {post.tags.join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* 日期 + 分类 */}
                    <div className='shrink-0 text-right'>
                      {post.date && (
                        <p className='text-xs tracking-[0.12em] text-ink-faint tabular-nums'>
                          {post.date.slice(5)}
                        </p>
                      )}
                      {post.category && (
                        <p className='mt-1 text-xs tracking-[0.14em] text-cinnabar-soft'>
                          {post.category}
                        </p>
                      )}
                    </div>

                    {/* 箭头 */}
                    <span className='shrink-0 text-ink-faint opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cinnabar group-hover:opacity-100'>
                      ⟶
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}

      {/* 页脚 */}
      <Footer />
    </main>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts()
  return {
    props: { posts },
    revalidate: Number(BLOG.REVALIDATE_SECOND) || 60
  }
}
