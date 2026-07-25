import BLOG from '@/blog.config'
import { useEffect, useState } from 'react'

type Phase = 'show' | 'open' | 'done'

/**
 * 开屏动画
 * 深墨幕布 → 装饰线延展 → 标题逐字墨迹晕染 → 朱砂印章钤盖 → 幕布上下开启
 * 每次页面加载（刷新/直达）均播放，播放期间锁定滚动
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('show')
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(true)
    document.body.style.overflow = 'hidden'

    // 2.7s 内容淡出 + 幕布开启，3.7s 完全卸载
    const t1 = setTimeout(() => setPhase('open'), 2700)
    const t2 = setTimeout(() => {
      setPhase('done')
      document.body.style.overflow = ''
    }, 3700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [])

  // 服务端与客户端首帧均不渲染，避免 hydration 不一致
  if (!enabled || phase === 'done') return null

  const opening = phase === 'open'
  const chars = BLOG.TITLE.split('')

  return (
    <div className='splash' aria-hidden='true'>
      {/* 上下幕布 */}
      <div
        className={`splash-panel splash-panel-top ${opening ? 'animate-curtain-up' : ''}`}
      />
      <div
        className={`splash-panel splash-panel-bottom ${opening ? 'animate-curtain-down' : ''}`}
      />

      {/* 中心内容 */}
      <div className={`splash-content ${opening ? 'animate-fade-out' : ''}`}>
        {/* 顶部装饰线 */}
        <div
          className='animate-line-grow mb-10 h-px w-28 bg-gradient-to-r from-transparent via-cinnabar-soft/70 to-transparent'
          style={{ animationDelay: '0.1s' }}
        />

        {/* 标题逐字晕染 */}
        <h1 className='text-5xl font-medium tracking-[0.16em] pl-[0.16em] md:text-6xl'>
          {chars.map((c, i) => (
            <span
              key={i}
              className='splash-char'
              style={{ animationDelay: `${0.35 + i * 0.09}s` }}>
              {c}
            </span>
          ))}
        </h1>

        {/* 副标题 */}
        <p
          className='animate-fade-up mt-7 text-sm tracking-[0.32em] pl-[0.32em] text-paper/55'
          style={{ animationDelay: '1.5s' }}>
          {BLOG.DESCRIPTION}
        </p>

        {/* 朱砂印章（冷苏个人印） */}
        <div className='splash-seal mt-11' style={{ animationDelay: '1.85s' }}>
          苏
        </div>

        {/* 底部装饰线 */}
        <div
          className='animate-line-grow mt-10 h-px w-16 bg-gradient-to-r from-transparent via-paper/30 to-transparent'
          style={{ animationDelay: '0.5s' }}
        />
      </div>
    </div>
  )
}
