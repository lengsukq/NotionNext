import BLOG from '@/blog.config'
import { useEffect, useState } from 'react'

type Phase = 'show' | 'open' | 'done'

/** 花瓣配置：位置、动画延迟、时长、大小、旋转角度 */
const petalConfigs = [
  { left: '10%', delay: '1.2s', duration: '5s', size: 7, rotation: '170deg' },
  { left: '24%', delay: '2s', duration: '5.8s', size: 5, rotation: '260deg' },
  { left: '42%', delay: '0.8s', duration: '4.5s', size: 8, rotation: '90deg' },
  { left: '58%', delay: '2.5s', duration: '5.2s', size: 6, rotation: '350deg' },
  { left: '75%', delay: '1.5s', duration: '6s', size: 5, rotation: '45deg' },
  { left: '88%', delay: '0.5s', duration: '4.8s', size: 7, rotation: '220deg' },
]

/** 墨点晕染配置 */
const inkDotConfigs = [
  { left: '8%', top: '55%', size: 120, delay: '1.2s' },
  { left: '75%', top: '58%', size: 90, delay: '1.6s' },
  { left: '68%', top: '25%', size: 60, delay: '0.9s' },
  { left: '15%', top: '32%', size: 50, delay: '1.4s' },
]

/**
 * 开屏动画
 * 宣纸幕布 → 水墨远山浮现 → 孤月入境 → 标题逐字墨迹晕染
 * → 书法下划线 → 副标题淡入 → 朱砂印章钤盖 → 花瓣飘落
 * → 幕布上下开启 → 淡出
 * 每次页面加载（刷新/直达）均播放，播放期间锁定滚动
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('show')
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(true)
    document.body.style.overflow = 'hidden'

    // 3.2s 内容淡出 + 幕布开启，4.2s 完全卸载
    const t1 = setTimeout(() => setPhase('open'), 3200)
    const t2 = setTimeout(() => {
      setPhase('done')
      document.body.style.overflow = ''
    }, 4200)

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
  // 下划线在最后一个字出现后再延迟 0.15s 开始绘制
  const lastCharDelay = 0.35 + chars.length * 0.09
  const underlineDelay = `${lastCharDelay + 0.15}s`

  return (
    <div className='splash' aria-hidden='true'>
      {/* 上下幕布 */}
      <div
        className={`splash-panel splash-panel-top ${opening ? 'animate-curtain-up' : ''}`}
      />
      <div
        className={`splash-panel splash-panel-bottom ${opening ? 'animate-curtain-down' : ''}`}
      />

      {/* 淡墨远山 */}
      <div className={`splash-landscape ${opening ? 'animate-fade-out' : ''}`} />

      {/* 孤月 */}
      <div className={`splash-moon ${opening ? 'animate-fade-out' : ''}`} />

      {/* 飘落花瓣 */}
      {petalConfigs.map((p, i) => (
        <div
          key={`petal-${i}`}
          className='splash-petal'
          style={{
            left: p.left,
            '--size': `${p.size}px`,
            '--duration': p.duration,
            '--delay': p.delay,
            '--rotation': p.rotation,
          } as React.CSSProperties}
        />
      ))}

      {/* 墨点晕染 */}
      {inkDotConfigs.map((d, i) => (
        <div
          key={`inkdot-${i}`}
          className='splash-inkdot'
          style={{
            left: d.left,
            top: d.top,
            '--dot-size': `${d.size}px`,
            '--dot-delay': d.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* 中心内容 */}
      <div className={`splash-content ${opening ? 'animate-fade-out' : ''}`}>
        {/* 顶部装饰线 */}
        <div
          className='animate-line-grow mb-10 h-px w-28 bg-gradient-to-r from-transparent via-cinnabar-soft/70 to-transparent'
          style={{ animationDelay: '0.1s' }}
        />

        {/* 标题 + 书法下划线 */}
        <div className='flex flex-col items-center'>
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

          {/* 书法下划线 */}
          <div
            className='splash-underline'
            style={{ animationDelay: underlineDelay }}
          />
        </div>

        {/* 副标题 */}
        <p
          className='animate-fade-up mt-7 text-sm tracking-[0.32em] pl-[0.32em] text-ink/55'
          style={{ animationDelay: '1.7s' }}>
          {BLOG.DESCRIPTION}
        </p>

        {/* 朱砂印章 */}
        <div className='splash-seal mt-11' style={{ animationDelay: '2.2s' }}>
          苏
        </div>

        {/* 底部装饰线 */}
        <div
          className='animate-line-grow mt-10 h-px w-16 bg-gradient-to-r from-transparent via-ink/20 to-transparent'
          style={{ animationDelay: '0.6s' }}
        />
      </div>
    </div>
  )
}
