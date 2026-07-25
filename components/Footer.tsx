import BLOG from '@/blog.config'

/**
 * 统一页脚 · 远山剪影 + 竖排站名 + 个人品牌
 */
export default function Footer() {
  return (
    <footer className='relative overflow-hidden border-t border-line/70'>
      {/* 远山剪影装饰 */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-full opacity-[0.035]' aria-hidden='true'>
        <svg
          className='absolute bottom-0 w-full'
          viewBox='0 0 1440 220'
          fill='currentColor'
          preserveAspectRatio='none'>
          <path d='M0 220 L0 160 Q180 60 360 140 Q480 190 600 120 Q720 50 840 130 Q960 200 1080 100 Q1200 30 1320 110 Q1380 150 1440 120 L1440 220 Z' />
        </svg>
      </div>

      <div className='relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-16 sm:flex-row sm:items-start sm:justify-between sm:py-20'>
        {/* 竖排站名装饰 */}
        <div className='writing-vertical hidden select-none text-sm tracking-[0.5em] text-ink-faint/40 sm:block' aria-hidden='true'>
          {BLOG.TITLE}
        </div>

        {/* 中心信息 */}
        <div className='text-center text-xs leading-loose tracking-[0.2em] text-ink-faint'>
          <span className='mb-3 block text-base text-cinnabar'>⁂</span>
          <span className='text-ink-soft'>{BLOG.AUTHOR}</span> · {new Date().getFullYear()}
          <br />
          <span className='text-ink-faint/80'>{BLOG.BIO}</span>
          {BLOG.GITHUB && (
            <>
              <br />
              <a
                href={BLOG.GITHUB}
                target='_blank'
                rel='noreferrer'
                className='ink-underline mt-2 inline-block tracking-[0.18em] text-ink-faint transition-colors duration-300 hover:text-cinnabar'>
                GitHub · {BLOG.GITHUB.replace('https://github.com/', '')} ⟶
              </a>
            </>
          )}
        </div>

        {/* 右侧装饰 */}
        <div className='hidden flex-col items-center gap-3 sm:flex' aria-hidden='true'>
          <span className='h-10 w-px bg-gradient-to-b from-transparent via-line to-transparent' />
          <span className='text-cinnabar/40'>❦</span>
          <span className='h-10 w-px bg-gradient-to-b from-transparent via-line to-transparent' />
        </div>
      </div>

      {/* 底栏 */}
      <div className='relative border-t border-line/40 py-4 text-center text-[10px] tracking-[0.3em] text-ink-faint/50'>
        {BLOG.TITLE} · 以文会友
      </div>
    </footer>
  )
}
