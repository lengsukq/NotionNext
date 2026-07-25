import BLOG from '@/blog.config'
import { useEffect, useRef, useState } from 'react'

type Phase = 'show' | 'open' | 'done'

/** 最短展示时长（保证动画完整播放） */
const MIN_DURATION = 2800
/** 最长等待时长（兆底，防止 load 事件不触发） */
const MAX_DURATION = 7000

/** 花瓣配置 */
const petalConfigs = [
  { left: '8%', delay: '1.2s', duration: '5s', size: 7, rotation: '170deg' },
  { left: '20%', delay: '2s', duration: '5.8s', size: 5, rotation: '260deg' },
  { left: '35%', delay: '0.8s', duration: '4.5s', size: 8, rotation: '90deg' },
  { left: '52%', delay: '2.5s', duration: '5.2s', size: 6, rotation: '350deg' },
  { left: '66%', delay: '1.5s', duration: '6s', size: 5, rotation: '45deg' },
  { left: '78%', delay: '0.5s', duration: '4.8s', size: 7, rotation: '220deg' },
  { left: '90%', delay: '1.8s', duration: '5.5s', size: 6, rotation: '300deg' },
  { left: '45%', delay: '3s', duration: '6.2s', size: 5, rotation: '130deg' }
]

/** 墨点晕染配置 */
const inkDotConfigs = [
  { left: '8%', top: '55%', size: 120, delay: '1.2s' },
  { left: '75%', top: '58%', size: 90, delay: '1.6s' },
  { left: '68%', top: '25%', size: 60, delay: '0.9s' },
  { left: '15%', top: '32%', size: 50, delay: '1.4s' },
  { left: '42%', top: '75%', size: 70, delay: '1.8s' }
]

/** 飞鸟配置：起始位置、飞行位移、延迟、时长、大小 */
const birdConfigs = [
  { left: '12%', top: '22%', dx: '26vw', dy: '-8vh', delay: '0.8s', duration: '3.2s', size: 10 },
  { left: '18%', top: '28%', dx: '30vw', dy: '-12vh', delay: '1.1s', duration: '3.6s', size: 8 },
  { left: '8%', top: '18%', dx: '22vw', dy: '-6vh', delay: '1.5s', duration: '3s', size: 7 },
  { left: '70%', top: '15%', dx: '-24vw', dy: '-9vh', delay: '1.3s', duration: '3.4s', size: 9 },
  { left: '78%', top: '20%', dx: '-20vw', dy: '-5vh', delay: '1.7s', duration: '2.9s', size: 6 }
]

/** 流萤配置 */
const fireflyConfigs = [
  { left: '15%', top: '65%', size: 5, delay: '1.4s', duration: '3.5s', dx: '12px', dy: '-18px' },
  { left: '80%', top: '60%', size: 4, delay: '1.8s', duration: '4s', dx: '-10px', dy: '-14px' },
  { left: '60%', top: '72%', size: 6, delay: '2.2s', duration: '3.2s', dx: '8px', dy: '-20px' },
  { left: '30%', top: '58%', size: 4, delay: '2.6s', duration: '4.2s', dx: '-14px', dy: '-12px' },
  { left: '88%', top: '42%', size: 5, delay: '2s', duration: '3.8s', dx: '-8px', dy: '-16px' },
  { left: '45%', top: '80%', size: 4, delay: '2.4s', duration: '3.6s', dx: '10px', dy: '-22px' }
]

/**
 * 开屏动画
 * 宣纸幕布 → 水墨远山 → 孤月 → 墨竹摇曳 → 飞鸟掠空 → 流萤浮游
 * → 标题逐字墨迹晕染 → 光晕呼吸 → 书法下划线 → 副标题
 * → 加载圆环（等待页面资源就绪）→ 花瓣飘落 → 幕布上下开启 → 淡出
 * 当页面加载完成且最短展示时间已过时自动关闭
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('show')
  const [enabled, setEnabled] = useState(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    setEnabled(true)
    startTime.current = Date.now()
    document.body.style.overflow = 'hidden'

    let openTimer: ReturnType<typeof setTimeout> | null = null
    let doneTimer: ReturnType<typeof setTimeout> | null = null

    const open = () => {
      // 确保最短展示时间已过
      const elapsed = Date.now() - startTime.current
      const remaining = Math.max(0, MIN_DURATION - elapsed)
      openTimer = setTimeout(() => {
        setPhase('open')
        doneTimer = setTimeout(() => {
          setPhase('done')
          document.body.style.overflow = ''
        }, 1000)
      }, remaining)
    }

    // 页面资源加载完成后触发（数据已随 SSG/ISR 内联，此时图片/字体也就绪）
    if (document.readyState === 'complete') {
      open()
    } else {
      window.addEventListener('load', open, { once: true })
    }

    // 兆底超时
    const maxTimer = setTimeout(open, MAX_DURATION)

    return () => {
      window.removeEventListener('load', open)
      clearTimeout(maxTimer)
      if (openTimer) clearTimeout(openTimer)
      if (doneTimer) clearTimeout(doneTimer)
      document.body.style.overflow = ''
    }
  }, [])

  // 服务端与客户端首帧均不渲染，避免 hydration 不一致
  if (!enabled || phase === 'done') return null

  const opening = phase === 'open'
  const chars = BLOG.TITLE.split('')
  const lastCharDelay = 0.35 + chars.length * 0.09
  const underlineDelay = `${lastCharDelay + 0.15}s`

  return (
    <div className='splash' aria-hidden='true'>
      {/* 上下幕布 */}
      <div className={`splash-panel splash-panel-top ${opening ? 'animate-curtain-up' : ''}`} />
      <div className={`splash-panel splash-panel-bottom ${opening ? 'animate-curtain-down' : ''}`} />

      {/* 淡墨远山 */}
      <div className={`splash-landscape ${opening ? 'animate-fade-out' : ''}`} />

      {/* 孤月 */}
      <div className={`splash-moon ${opening ? 'animate-fade-out' : ''}`} />

      {/* 墨竹枝影 · 左下 */}
      <div className={`splash-bamboo left-[4%] ${opening ? 'animate-fade-out' : ''}`}>
        <svg width='90' height='200' viewBox='0 0 90 200' fill='none' opacity='0.12'>
          <path d='M30 200 C32 160 28 120 34 80 C38 55 30 30 36 5' stroke='#2e2b24' strokeWidth='3' strokeLinecap='round' />
          <path d='M34 80 C48 72 62 70 78 62' stroke='#2e2b24' strokeWidth='2' strokeLinecap='round' />
          <path d='M33 110 C20 100 12 92 4 88' stroke='#2e2b24' strokeWidth='2' strokeLinecap='round' />
          <path d='M35 50 C46 42 54 38 66 30' stroke='#2e2b24' strokeWidth='1.8' strokeLinecap='round' />
          <ellipse cx='78' cy='60' rx='14' ry='4' transform='rotate(-15 78 60)' fill='#2e2b24' opacity='0.7' />
          <ellipse cx='66' cy='28' rx='12' ry='3.5' transform='rotate(-20 66 28)' fill='#2e2b24' opacity='0.6' />
          <ellipse cx='4' cy='86' rx='13' ry='4' transform='rotate(12 4 86)' fill='#2e2b24' opacity='0.65' />
        </svg>
      </div>

      {/* 墨竹枝影 · 右下（镜像） */}
      <div className={`splash-bamboo right-[3%] ${opening ? 'animate-fade-out' : ''}`} style={{ animationDelay: '0.6s' }}>
        <svg width='70' height='160' viewBox='0 0 90 200' fill='none' opacity='0.09' style={{ transform: 'scaleX(-1)' }}>
          <path d='M30 200 C32 160 28 120 34 80 C38 55 30 30 36 5' stroke='#2e2b24' strokeWidth='3' strokeLinecap='round' />
          <path d='M34 80 C48 72 62 70 78 62' stroke='#2e2b24' strokeWidth='2' strokeLinecap='round' />
          <path d='M35 50 C46 42 54 38 66 30' stroke='#2e2b24' strokeWidth='1.8' strokeLinecap='round' />
          <ellipse cx='78' cy='60' rx='14' ry='4' transform='rotate(-15 78 60)' fill='#2e2b24' opacity='0.7' />
          <ellipse cx='66' cy='28' rx='12' ry='3.5' transform='rotate(-20 66 28)' fill='#2e2b24' opacity='0.6' />
        </svg>
      </div>

      {/* 飞鸟掠空 */}
      {birdConfigs.map((b, i) => (
        <div
          key={`bird-${i}`}
          className={`splash-bird ${opening ? 'animate-fade-out' : ''}`}
          style={{
            left: b.left,
            top: b.top,
            '--bird-size': `${b.size}px`,
            '--bird-delay': b.delay,
            '--bird-duration': b.duration,
            '--bird-dx': b.dx,
            '--bird-dy': b.dy
          } as React.CSSProperties}
        />
      ))}

      {/* 流萤浮游 */}
      {fireflyConfigs.map((f, i) => (
        <div
          key={`firefly-${i}`}
          className={`splash-firefly ${opening ? 'animate-fade-out' : ''}`}
          style={{
            left: f.left,
            top: f.top,
            '--ff-size': `${f.size}px`,
            '--ff-delay': f.delay,
            '--ff-duration': f.duration,
            '--ff-dx': f.dx,
            '--ff-dy': f.dy
          } as React.CSSProperties}
        />
      ))}

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
            '--rotation': p.rotation
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
            '--dot-delay': d.delay
          } as React.CSSProperties}
        />
      ))}

      {/* 中心内容 */}
      <div className={`splash-content ${opening ? 'animate-fade-out' : ''}`}>
        {/* 标题光晕 */}
        <div className='splash-halo' style={{ top: '50%', left: '50%', marginLeft: '-170px', marginTop: '-170px' }} />

        {/* 顶部装饰线 */}
        <div
          className='animate-line-grow mb-10 h-px w-28 bg-gradient-to-r from-transparent via-cinnabar-soft/70 to-transparent'
          style={{ animationDelay: '0.1s' }}
        />

        {/* 标题 + 书法下划线 */}
        <div className='relative flex flex-col items-center'>
          <h1 className='pl-[0.16em] text-5xl font-medium tracking-[0.16em] md:text-6xl'>
            {chars.map((c, i) => (
              <span
                key={i}
                className='splash-char'
                style={{ animationDelay: `${0.35 + i * 0.09}s` }}>
                {c}
              </span>
            ))}
          </h1>
          <div className='splash-underline' style={{ animationDelay: underlineDelay }} />
        </div>

        {/* 副标题 */}
        <p
          className='animate-fade-up mt-7 pl-[0.32em] text-sm tracking-[0.32em] text-ink/55'
          style={{ animationDelay: '1.7s' }}>
          {BLOG.DESCRIPTION}
        </p>

        {/* 加载圆环 · 朱砂描边旋转，页面就绪后停转 */}
        <div className='mt-11 flex flex-col items-center gap-3'>
          <div className={`splash-loader ${opening ? 'splash-loader-done' : ''}`}>
            <svg width='44' height='44' viewBox='0 0 44 44'>
              {/* 底环 */}
              <circle cx='22' cy='22' r='18' fill='none' stroke='rgba(168, 68, 46, 0.12)' strokeWidth='2' />
              {/* 旋转朱砂弧 */}
              <circle
                cx='22' cy='22' r='18'
                fill='none'
                stroke='rgba(168, 68, 46, 0.75)'
                strokeWidth='2'
                strokeLinecap='round'
                strokeDasharray='28 85'
                className='splash-loader-arc'
              />
            </svg>
            {/* 中心印章字 */}
            <span className='splash-loader-char'>{BLOG.AUTHOR.slice(-1)}</span>
          </div>
          <span className='animate-fade-up text-[10px] tracking-[0.35em] text-ink/40' style={{ animationDelay: '2s' }}>
            正在研磨铺纸…
          </span>
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
