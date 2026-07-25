import BLOG from '@/blog.config'
import Link from 'next/link'

/** 花瓣配置 */
const petals = [
  { left: '15%', delay: '0s', duration: '6s', size: 8 },
  { left: '30%', delay: '1.5s', duration: '7s', size: 6 },
  { left: '50%', delay: '0.8s', duration: '5.5s', size: 7 },
  { left: '68%', delay: '2.2s', duration: '6.5s', size: 5 },
  { left: '82%', delay: '1s', duration: '7.5s', size: 8 },
  { left: '92%', delay: '3s', duration: '6s', size: 6 }
]

/**
 * 404 · 花瓣飘落 + 风吹散文字 + 水墨晕染
 */
export default function NotFound() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center'>
      {/* 水墨晕染背景 */}
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <span className='absolute left-[10%] top-[20%] h-48 w-48 rounded-full bg-ink/[0.02] blur-3xl' />
        <span className='absolute bottom-[25%] right-[12%] h-64 w-64 rounded-full bg-cinnabar/[0.03] blur-3xl' />
        <span className='absolute left-[45%] top-[60%] h-40 w-40 rounded-full bg-ink/[0.015] blur-2xl' />
      </div>

      {/* 飘落花瓣 */}
      {petals.map((p, i) => (
        <span
          key={i}
          className='splash-petal'
          style={{
            left: p.left,
            '--size': `${p.size}px`,
            '--duration': p.duration,
            '--delay': p.delay,
            '--rotation': `${120 + i * 40}deg`
          } as React.CSSProperties}
          aria-hidden='true'
        />
      ))}

      <div className='animate-fade-up text-2xl text-cinnabar'>❦</div>
      <h1
        className='animate-fade-up mt-6 text-[6rem] leading-none font-semibold text-line tabular-nums sm:text-[8rem]'
        style={{ animationDelay: '0.15s', animationDuration: '1.2s' }}>
        404
      </h1>
      <p
        className='animate-fade-up animate-wind-away mt-6 pl-[0.3em] text-lg tracking-[0.3em] text-ink-soft'
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
        className='btn-cinnabar animate-fade-up group mt-12 inline-flex items-center gap-3 border border-ink/25 px-9 py-3 text-sm tracking-[0.25em] text-ink transition-all duration-500 hover:border-cinnabar hover:text-paper'
        style={{ animationDelay: '0.65s' }}>
        <span className='transition-transform duration-500 group-hover:-translate-x-1'>
          ⟵
        </span>
        归去来兮
      </Link>
    </main>
  )
}
