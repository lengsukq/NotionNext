# 冷苏手记

> 编程铸就思维，思维成就编程

一个由 Notion 驱动的个人技术博客，记录前端、移动端、Python 与桌面应用的开发实践与踩坑心得。

## 技术栈

- Next.js (Pages Router + SSG/ISR)
- TypeScript + Tailwind CSS v4
- react-notion-x（Notion 内容渲染）
- notion-client（Notion 非官方 API）

## 本地开发

```bash
# 安装依赖
yarn

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 NOTION_PAGE_ID

# 启动开发服务器
yarn dev
```

## 致谢

本项目的灵感来源于 [NotionNext](https://github.com/tangly1024/NotionNext)（by [tangly1024](https://github.com/tangly1024)）——用 Notion 作为 CMS 搭建博客的点子。在此基础上，我从零重写了极简解析器与文艺风主题，使其成为完全属于自己的技术博客。

---

© [冷苏](https://github.com/lengsukq) · lengsu.top
