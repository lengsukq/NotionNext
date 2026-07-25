import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

/**
 * 页面过渡动画
 * 路由切换时宣纸幕布覆盖 + 墨晕扩散，完成后揭开
 */
export default function PageTransition() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onStart = () => {
      setActive(true)
    }
    const onComplete = () => {
      // 新页面渲染后短暂停留再揭开
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setActive(false), 280)
    }

    router.events.on('routeChangeStart', onStart)
    router.events.on('routeChangeComplete', onComplete)
    router.events.on('routeChangeError', onComplete)

    return () => {
      router.events.off('routeChangeStart', onStart)
      router.events.off('routeChangeComplete', onComplete)
      router.events.off('routeChangeError', onComplete)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [router.events])

  if (!active) return null

  return (
    <div className='page-transition-overlay animate-ink-spread' aria-hidden='true'>
      <div className='transition-ink' />
    </div>
  )
}
