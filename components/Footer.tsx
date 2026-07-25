import BLOG from '@/blog.config'

/**
 * 统一页脚 · 个人品牌
 */
export default function Footer() {
  return (
    <footer className='border-t border-line/70 py-14 text-center'>
      <div className='text-xs leading-loose tracking-[0.2em] text-ink-faint'>
        <span className='mb-3 block text-base text-cinnabar'>⁂</span>
        <span className='text-ink-soft'>{BLOG.AUTHOR}</span> ·{' '}
        {new Date().getFullYear()}
        <br />
        {BLOG.BIO}
        {BLOG.GITHUB && (
          <>
            <br />
            <a
              href={BLOG.GITHUB}
              target='_blank'
              rel='noreferrer'
              className='mt-1 inline-block tracking-[0.18em] text-ink-faint transition-colors duration-300 hover:text-cinnabar'>
              GitHub · lengsukq ⟶
            </a>
          </>
        )}
      </div>
    </footer>
  )
}
