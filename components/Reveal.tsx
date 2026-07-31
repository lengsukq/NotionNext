import { useEffect, useRef, useState, type ReactNode } from 'react'

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade' | 'blur'

const variantClass: Record<RevealVariant, string> = {
  up: 'reveal-up',
  down: 'reveal-down',
  left: 'reveal-left',
  right: 'reveal-right',
  zoom: 'reveal-zoom',
  fade: '',
  blur: 'reveal-blur'
}

/**
 * 滚动浮现包装器：元素进入视口时按指定变体优雅浮现
 * 变体：up 上浮 / down 下沉 / left 左滑入 / right 右滑入 / zoom 缩放 / fade 纯淡入 / blur 模糊浮现
 */
export default function Reveal({
  children,
  delay = 0,
  variant = 'up',
  once = true,
  className = ''
}: {
  children: ReactNode
  delay?: number
  variant?: RevealVariant
  once?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) io.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass[variant]} ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
