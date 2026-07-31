import 'react-notion-x/src/styles.css'
import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-tomorrow.css'
// 自定义样式放最后，覆盖 react-notion-x 默认样式
import '@/styles/globals.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import BLOG from '@/blog.config'
import SplashScreen from '@/components/SplashScreen'
import ScrollProgress from '@/components/ScrollProgress'
import PageTransition from '@/components/PageTransition'
import BackToTop from '@/components/BackToTop'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>{BLOG.TITLE}</title>
        <meta name='description' content={BLOG.DESCRIPTION} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {/* 开屏动画（每会话一次） */}
      <SplashScreen />
      {/* 全局动效组件 */}
      <ScrollProgress />
      <PageTransition />
      <BackToTop />
      {/* 路由切换后新页面以淡入上移入场，与幕布揭开衔接 */}
      <div key={router.asPath} className='animate-page-enter'>
        <Component {...pageProps} />
      </div>
    </>
  )
}
