import { useEffect, useState } from 'react'

/**
 * 回到顶部按钮 · 滚动超过一屏后浮现
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!mounted) return null

  return (
    <button
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label='回到顶部'
      title='回到顶部'>
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
        <path
          d='M8 14V3M8 3L3.5 7.5M8 3l4.5 4.5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  )
}
