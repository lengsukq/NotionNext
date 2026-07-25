import { useEffect, useState } from 'react'

/**
 * 滚动进度条 · 页面顶部朱砂细线
 * 随滚动显示阅读进度，带毛笔笔触渐变
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let raf = 0

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement
        const scrollTop = doc.scrollTop || document.body.scrollTop
        const scrollHeight = doc.scrollHeight - doc.clientHeight
        setProgress(scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!mounted || progress <= 0.002) return null

  return (
    <div
      className='scroll-progress-bar'
      style={{ width: `${progress * 100}%` }}
      aria-hidden='true'
    />
  )
}
