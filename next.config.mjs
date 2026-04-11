import nextra from 'nextra'

const withNextra = nextra({
  latex: false,
  defaultShowCopyCode: true
})

export default withNextra({
  typescript: {
    // Layout uses nextra/page-map which doesn't ship .d.ts — ignore during build
    ignoreBuildErrors: true
  }
})
