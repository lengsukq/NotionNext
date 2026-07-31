import BLOG from '@/blog.config'
import { useEffect, useRef, useState } from 'react'

type Phase = 'show' | 'leaving' | 'done'

/** 最短展示时长（保证动画完整播放） */
const MIN_DURATION = 1800
/** 最长等待时长（兜底，防止 load 事件不触发） */
const MAX_DURATION = 4000
/** 离场动画时长 */
const EXIT_DURATION = 650

/**
 * 开屏动画（极简留白风）
 * 宣纸底色上，印章落印 → 标题淡入+字距展开 → 副标题淡入 → 朱砂墨点呼吸
 * 当页面加载完成且最短展示时间已过时整体优雅淡出
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('show')
  const [enabled, setEnabled] = useState(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    setEnabled(true)
    startTime.current = Date.now()
    document.body.style.overflow = 'hidden'

    let leaveTimer: ReturnType<typeof setTimeout> | null = null
    let doneTimer: ReturnType<typeof setTimeout> | null = null

    const leave = () => {
      // 确保最短展示时间已过
      const elapsed = Date.now() - startTime.current
      const remaining = Math.max(0, MIN_DURATION - elapsed)
      leaveTimer = setTimeout(() => {
        setPhase('leaving')
        doneTimer = setTimeout(() => {
          setPhase('done')
          document.body.style.overflow = ''
        }, EXIT_DURATION)
      }, remaining)
    }

    // 页面资源加载完成后触发（数据已随 SSG/ISR 内联，此时图片/字体也就绪）
    if (document.readyState === 'complete') {
      leave()
    } else {
      window.addEventListener('load', leave, { once: true })
    }

    // 兜底超时
    const maxTimer = setTimeout(leave, MAX_DURATION)

    return () => {
      window.removeEventListener('load', leave)
      clearTimeout(maxTimer)
      if (leaveTimer) clearTimeout(leaveTimer)
      if (doneTimer) clearTimeout(doneTimer)
      document.body.style.overflow = ''
    }
  }, [])

  // 服务端与客户端首帧均不渲染，避免 hydration 不一致
  if (!enabled || phase === 'done') return null

  return (
    <div className={`splash ${phase === 'leaving' ? 'leaving' : ''}`} aria-hidden='true'>
      <div className='splash-content'>
        {/* 站点印章 logo · 盖印入场 */}
        <img src='/logo.png' alt='' className='splash-logo' />

        {/* 标题 · 淡入 + 字距展开 */}
        <h1 className='splash-title pl-[0.16em]'>{BLOG.TITLE}</h1>

        {/* 副标题 · 与标题以留白过渡 */}
        <p className='splash-subtitle' style={{ animationDelay: '0.85s' }}>
          {BLOG.DESCRIPTION}
        </p>

        {/* 加载指示 · 朱砂墨点呼吸 */}
        <div className='splash-ink-dot' style={{ animationDelay: '1.1s' }} />
      </div>
    </div>
  )
}
