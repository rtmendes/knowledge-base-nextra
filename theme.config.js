import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Insight Profit KB</span>,
  docsRepositoryBase: 'https://github.com/insightprofit/knowledge-base-nextra/blob/main',
  footer: {
    text: '© 2026 Insight Profit. All rights reserved.'
  },
  toc: {
    float: true
  },
  sidebar: {
    defaultMenuCollapseLevel: 1
  }
}

export default config
