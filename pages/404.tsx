import BLOG from '@/blog.config'
import Link from 'next/link'

/**
 * 404 · 文艺风
 */
export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center px-6 text-center'>
      <div className='animate-fade-up text-cinnabar text-2xl'>❦</div>
      <h1
        className='animate-fade-up mt-6 text-[7rem] leading-none font-semibold text-line tabular-nums'
        style={{ animationDelay: '0.15s', animationDuration: '1.2s' }}>
        404
      </h1>
      <p
        className='animate-fade-up mt-6 pl-[0.3em] text-lg tracking-[0.3em] text-ink-soft'
        style={{ animationDelay: '0.35s' }}>
        所寻之页，已随风而去
      </p>
      <p
        className='animate-fade-up mt-3 text-xs tracking-[0.2em] text-ink-faint'
        style={{ animationDelay: '0.5s' }}>
        {BLOG.TITLE}
      </p>
      <Link
        href='/'
        className='animate-fade-up group mt-12 inline-flex items-center gap-3 border border-ink/25 px-9 py-3 text-sm tracking-[0.25em] text-ink transition-all duration-500 hover:border-cinnabar hover:bg-cinnabar hover:text-paper'
        style={{ animationDelay: '0.65s' }}>
        <span className='transition-transform duration-500 group-hover:-translate-x-1'>
          ⟵
        </span>
        归去来兮
      </Link>
    </main>
  )
}
