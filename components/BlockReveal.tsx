import { useEffect, useRef, type ReactNode } from 'react'

/** 仅选择正文容器的一级子块，避免嵌套块重复触发 */
const BLOCK_SELECTOR = '.notion-page-content > *'

/**
 * 根据块类型匹配入场变体
 * 标题上浮 / 代码块缩放 / 图片模糊浮现 / 引用左滑入
 */
function getBlockVariant(el: Element): string {
  const className = el.className
  if (typeof className !== 'string') return ''
  if (className.includes('notion-h')) return 'block-reveal-title'
  if (className.includes('notion-code')) return 'block-reveal-code'
  if (className.includes('notion-image') || className.includes('notion-asset')) {
    return 'block-reveal-image'
  }
  if (className.includes('notion-quote')) return 'block-reveal-quote'
  return ''
}

/**
 * 文章正文块滚动浮现
 * 对 react-notion-x 渲染的正文直接子块做 IntersectionObserver 入场，
 * 并用 MutationObserver 处理懒加载（Code/Equation 等）后动态渲染的块
 */
export default function BlockReveal({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let observer: IntersectionObserver | null = null
    let mutationObserver: MutationObserver | null = null

    const bindBlocks = () => {
      const blocks = container.querySelectorAll(BLOCK_SELECTOR)

      observer?.disconnect()
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('block-reveal-visible')
              observer?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      )

      blocks.forEach((block, index) => {
        if (block.classList.contains('block-reveal')) return
        block.classList.add('block-reveal')
        const variant = getBlockVariant(block)
        if (variant) block.classList.add(variant)
        ;(block as HTMLElement).style.transitionDelay = `${(index % 5) * 60}ms`
        observer?.observe(block)
      })
    }

    bindBlocks()
    mutationObserver = new MutationObserver(bindBlocks)
    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      observer?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [])

  return <div ref={containerRef}>{children}</div>
}
