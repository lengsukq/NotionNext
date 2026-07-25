import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='zh-CN'>
      <Head>
        {/* 文艺风衬线字体：思源宋体（中文）+ Cormorant Garamond（西文/数字） */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+SC:wght@300;400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
