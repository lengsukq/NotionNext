import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'covering' | 'revealing'

/** 面板覆盖（落下+淡入）时长 */
const COVER_MS = 250
/** 覆盖落定后停留时长 */
const HOLD_MS = 200
/** 面板揭开（向上收起）时长 */
const REVEAL_MS = 550

/**
 * 页面过渡动画（两阶段状态机）
 * 路由切换时：宣纸幕布自上方落下覆盖 → 短暂停留 → 向上揭开，新页内容随之浮现
 */
export default function PageTransition() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }

    const onStart = () => {
      clearTimers()
      setPhase('covering')
    }

    const onComplete = () => {
      // 面板落定并短暂停留后向上揭开
      timersRef.current.push(
        setTimeout(() => {
          setPhase('revealing')
          timersRef.current.push(setTimeout(() => setPhase('idle'), REVEAL_MS))
        }, COVER_MS + HOLD_MS)
      )
    }

    router.events.on('routeChangeStart', onStart)
    router.events.on('routeChangeComplete', onComplete)
    router.events.on('routeChangeError', onComplete)

    return () => {
      router.events.off('routeChangeStart', onStart)
      router.events.off('routeChangeComplete', onComplete)
      router.events.off('routeChangeError', onComplete)
      clearTimers()
    }
  }, [router.events])

  // 过渡期间锁定页面滚动，避免面板下内容被拖动
  useEffect(() => {
    document.body.style.overflow = phase === 'idle' ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  return (
    <div className={`page-transition-overlay ${phase}`} aria-hidden='true'>
      <div className='transition-ink' />
    </div>
  )
}
